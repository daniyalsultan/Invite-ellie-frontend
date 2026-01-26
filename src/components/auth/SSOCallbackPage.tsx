import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import { autoCreateWorkspaceForEmail } from '../../utils/workspaceAutoCreate';

export function SSOCallbackPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { establishSession, session, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const apiBaseUrl = getApiBaseUrl();
  const hasHandledRef = useRef(false);
  const sessionEstablishedRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current) {
      return;
    }
    hasHandledRef.current = true;

    const handleCallback = async () => {
      if (!apiBaseUrl) {
        setError('API base URL is not configured.');
        setIsProcessing(false);
        return;
      }

      // Extract code from URL - check both query params and hash
      // Supabase OAuth can return code in either location
      let code: string | null = searchParams.get('code');
      let errorParam: string | null = searchParams.get('error');
      let errorDescription: string | null = searchParams.get('error_description');

      // If not in query params, check hash (Supabase sometimes uses hash)
      if (!code && location.hash) {
        const hashParams = new URLSearchParams(location.hash.substring(1));
        code = hashParams.get('code');
        if (!errorParam) {
          errorParam = hashParams.get('error');
          errorDescription = hashParams.get('error_description');
        }
      }

      // Debug logging
      console.log('SSO Callback - URL params:', {
        code: code ? `${code.substring(0, 10)}...` : null,
        errorParam,
        errorDescription,
        fullUrl: window.location.href,
        search: location.search,
        hash: location.hash ? `${location.hash.substring(0, 50)}...` : null,
      });

      if (errorParam) {
        // Handle specific OAuth errors
        let message = errorDescription || 'SSO authentication failed. Please try again.';
        
        // Provide helpful error messages for common OAuth errors
        if (errorParam === 'invalid_request' && errorDescription?.includes('redirect_uri')) {
          message = 'Redirect URI mismatch. Please contact support or check your Azure AD app registration. The redirect URI must match exactly what is configured in Azure AD.';
        } else if (errorParam === 'access_denied') {
          message = 'Access was denied. Please try again or contact your administrator.';
        } else if (errorParam === 'invalid_client') {
          message = 'Invalid client configuration. Please contact support.';
        } else if (errorParam === 'unauthorized_client') {
          message = 'This application is not authorized. Please contact your administrator.';
        }
        
        console.error('SSO OAuth Error:', {
          error: errorParam,
          description: errorDescription,
          fullUrl: window.location.href,
        });
        
        setError(message);
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 5000);
        return;
      }

      if (!code) {
        setError('No authorization code received. Please try again.');
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
        return;
      }

      try {
        // POST /api/accounts/sso/callback/
        // Request body: {"code": "string"}
        // Response: {"access_token": "string", "refresh_token": "string", "expires_in": 0, "user_id": "string"}
        // Construct the API URL properly, avoiding double slashes
        const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const apiUrl = `${baseUrl}/accounts/sso/callback/`;
        
        console.log('Making SSO callback request:', {
          url: apiUrl,
          method: 'POST',
          code: code ? `${code.substring(0, 10)}...` : null,
          requestBody: { code },
        });
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include', // This is crucial for sending cookies in cross-origin requests
          body: JSON.stringify({ code }),
        });

        let responseData: unknown = null;
        let responseText = '';
        try {
          responseText = await response.text();
          if (responseText) {
            responseData = JSON.parse(responseText);
          }
        } catch (parseError) {
          // If JSON parsing fails, use the text response
          console.error('Failed to parse response:', parseError);
          responseData = { error: responseText || 'Invalid response from server' };
        }

        if (!response.ok) {
          // Extract error message from response
          let message = 'Unable to complete SSO authentication.';
          
          if (responseData && typeof responseData === 'object') {
            // Try common error field names
            if ('error' in responseData && typeof responseData.error === 'string') {
              message = responseData.error;
            } else if ('detail' in responseData && typeof responseData.detail === 'string') {
              message = responseData.detail;
            } else if ('message' in responseData && typeof responseData.message === 'string') {
              message = responseData.message;
            }
          } else if (responseText) {
            message = responseText;
          }
          
          // Log error for debugging
          console.error('SSO callback error:', {
            status: response.status,
            message,
            responseData,
          });
          
          // Provide user-friendly error message
          if (response.status === 400) {
            const lowerMessage = message.toLowerCase();
            if (lowerMessage.includes('pkce') || lowerMessage.includes('verifier')) {
              message = 'Session expired. Please try signing in again.';
            }
          }
          
          setError(message);
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
          return;
        }

        // Extract tokens from response
        if (
          responseData &&
          typeof responseData === 'object' &&
          'access_token' in responseData &&
          typeof responseData.access_token === 'string'
        ) {
          const data = responseData as {
            access_token: string;
            refresh_token?: string;
            expires_in?: number;
            user_id?: string;
          };

          const expiresAt = data.expires_in ? Date.now() + data.expires_in * 1000 : null;

          // Establish session
          establishSession(
            {
              accessToken: data.access_token,
              refreshToken: data.refresh_token ?? null,
              userId: data.user_id ?? null,
              expiresAt,
            },
            { rememberMe: true },
          );

          // Mark that we've established the session
          sessionEstablishedRef.current = true;

          // Auto-create workspace based on email domain
          // This will be handled after navigation when the session is fully ready
          // We'll let the ProfileContext fetch the profile, and then auto-create workspace
          // This avoids 401 errors from trying to use the token too quickly
          console.log('[SSOCallback] Session established, workspace auto-creation will happen after profile loads');

          // Don't navigate immediately - let the useEffect below handle navigation
          // once the session state is confirmed to be available
        } else {
          console.error('Invalid response format:', responseData);
          setError('Invalid response from server. Please try again.');
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
        }
      } catch (error) {
        console.error('SSO callback exception:', error);
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
        setError(errorMessage);
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 10000000);
      }
    };

    void handleCallback();
  }, [searchParams, location, navigate, establishSession, apiBaseUrl]);

  // Monitor session state and navigate once it's available and authenticated
  // This ensures navigation happens after the session state is fully propagated
  // and all context providers have had a chance to update
  useEffect(() => {
    if (sessionEstablishedRef.current && isAuthenticated && session?.accessToken) {
      // Session is now available and authenticated in React state
      // Wait a bit longer to ensure React has fully processed the state update
      // and the session is available in all contexts
      const timer = setTimeout(async () => {
        if (window.location.pathname === '/auth/callback') {
          console.log('[SSOCallback] Session confirmed and authenticated, preparing for navigation', {
            hasAccessToken: !!session?.accessToken,
            isAuthenticated,
            userId: session?.userId,
            expiresAt: session?.expiresAt,
          });

          // Now that session is ready, fetch profile to get email for workspace auto-creation
          if (session.accessToken && apiBaseUrl) {
            try {
              console.log('[SSOCallback] Fetching user profile to get email for workspace auto-creation');
              const profileResponse = await fetch(`${apiBaseUrl}/accounts/me/`, {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${session.accessToken}`,
                },
              });

              if (profileResponse.ok) {
                const profile = await profileResponse.json() as { email?: string };
                if (profile?.email) {
                  console.log('[SSOCallback] Found email in profile, triggering workspace auto-creation:', profile.email);
                  // Auto-create workspace in background (don't await - non-blocking)
                  autoCreateWorkspaceForEmail(session.accessToken, profile.email).catch((error) => {
                    console.error('[SSOCallback] Failed to auto-create workspace after SSO:', error);
                    // Don't throw - this is a background operation, navigation should continue
                  });
                } else {
                  console.warn('[SSOCallback] No email found in profile:', profile);
                }
              } else {
                console.warn('[SSOCallback] Failed to fetch profile for workspace auto-creation, status:', profileResponse.status);
                // Continue with navigation even if profile fetch fails
              }
            } catch (error) {
              console.error('[SSOCallback] Error fetching profile for workspace auto-creation:', error);
              // Continue with navigation even if profile fetch fails
            }
          }

          setIsProcessing(false);
          // Use a small additional delay before actual navigation to ensure state is stable
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 100);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [session, isAuthenticated, navigate, apiBaseUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        {isProcessing ? (
          <>
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-ellieBlue border-r-transparent"></div>
            <p className="font-nunito text-[18px] text-ellieGray">Completing authentication...</p>
          </>
        ) : error ? (
          <>
            <div className="mb-4 rounded-[12px] border border-red-200 bg-red-50 px-5 py-3 font-nunito text-[16px] text-red-600">
              {error}
            </div>
            <p className="font-nunito text-[16px] text-ellieGray">Redirecting to login...</p>
          </>
        ) : null}
      </div>
    </div>
  );
}

