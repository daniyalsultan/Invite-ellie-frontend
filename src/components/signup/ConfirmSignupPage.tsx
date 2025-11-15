import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type ConfirmationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

export function ConfirmSignupPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const { establishSession } = useAuth();

  // Extract token and email from both query params and hash (for Supabase redirects)
  const { token, email, error: urlError } = useMemo(() => {
    // First check query parameters
    let tokenParam = searchParams.get('token');
    let emailParam = searchParams.get('email');
    const errorParam = searchParams.get('error');

    // If no token in query params, check hash (Supabase sends tokens in hash)
    if (!tokenParam && location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      
      // Debug: log all hash parameters to see what Supabase sends
      const allHashParams = Object.fromEntries(hashParams.entries());
      console.log('All hash parameters:', allHashParams);
      console.log('Full hash string:', location.hash);
      
      // Try multiple possible token parameter names (Supabase might use different names)
      // Note: Supabase email confirmation tokens are typically in 'token' parameter
      // and are usually 40+ characters long
      const possibleTokenParams = [
        hashParams.get('token'),
        hashParams.get('token_hash'),
        hashParams.get('confirmation_token'),
        hashParams.get('access_token'),
        hashParams.get('otp'),
      ].filter(Boolean);
      
      // Prefer longer tokens (Supabase tokens are typically long)
      tokenParam = possibleTokenParams.find(t => t && t.length > 10) || 
                   possibleTokenParams[0] || 
                   tokenParam;
      emailParam = hashParams.get('email') || emailParam;
      
      // If token is found, log its details
      if (tokenParam) {
        console.log('Found token parameter:', {
          name: 'token',
          length: tokenParam.length,
          firstChars: tokenParam.substring(0, 20),
          isEncoded: tokenParam.includes('%')
        });
        
        // Warn if token seems too short (Supabase tokens are typically 40+ chars)
        if (tokenParam.length < 20) {
          console.warn('⚠️ Token is suspiciously short! Supabase tokens are typically 40+ characters. This might be the wrong parameter.');
        }
      } else {
        console.warn('⚠️ No token found in hash parameters! Check the "All hash parameters" log above.');
      }
    }

    // Debug: log extracted values
    console.log('Extracted token and email:', { 
      hasToken: !!tokenParam, 
      tokenLength: tokenParam?.length,
      hasEmail: !!emailParam,
      email: emailParam 
    });

    return {
      token: tokenParam ? tokenParam.trim() : null,
      email: emailParam ? emailParam.trim() : null,
      error: errorParam ? decodeURIComponent(errorParam) : null,
    };
  }, [searchParams, location.hash]);

  const [confirmation, setConfirmation] = useState<ConfirmationState>(() => {
    // Initialize with error if URL has error parameter
    if (urlError) {
      return { status: 'error', message: urlError };
    }
    return { status: 'idle' };
  });
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [emailInput, setEmailInput] = useState(email || '');
  const [shouldOfferResend, setShouldOfferResend] = useState(false);

  // Update email input when email from URL changes
  useEffect(() => {
    if (email && !emailInput) {
      setEmailInput(email);
    }
  }, [email, emailInput]);

  useEffect(() => {
    // If we have an error from URL, don't redirect
    if (urlError) {
      return;
    }

    // If no token, redirect to signup
    if (!token) {
      navigate('/signup', {
        replace: true,
        state: {
          confirmationNotice: 'Please complete the signup process to receive a valid confirmation link.',
        },
      });
    }
  }, [token, urlError, navigate]);

  // Use ref to prevent multiple API calls
  const hasCalledApi = useRef(false);
  const lastTokenRef = useRef<string | null>(null);
  const lastEmailRef = useRef<string | null>(null);
  const confirmationInProgress = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const confirmSignup = async () => {
      // Reset if token or email changed (new confirmation attempt)
      const currentEmail = email || emailInput.trim();
      if (lastTokenRef.current !== token || lastEmailRef.current !== currentEmail) {
        hasCalledApi.current = false;
        confirmationInProgress.current = false;
        lastTokenRef.current = token;
        lastEmailRef.current = currentEmail || null;
      }

      // Prevent multiple calls for the same token/email
      if (hasCalledApi.current || confirmationInProgress.current) {
        console.log('Skipping duplicate confirmation attempt for same token/email', {
          hasCalledApi: hasCalledApi.current,
          inProgress: confirmationInProgress.current
        });
        return;
      }

      if (!token) {
        console.warn('No token found in URL');
        return;
      }

      // Use email from input if not in URL
      const emailToUse = email || emailInput.trim();
      if (!emailToUse) {
        console.warn('No email found - waiting for user input');
        if (isMounted) {
          setConfirmation({
            status: 'error',
            message: 'Email address is required for confirmation. Please enter your email address below.',
          });
        }
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailToUse)) {
        if (isMounted) {
          setConfirmation({
            status: 'error',
            message: 'Please enter a valid email address.',
          });
        }
        return;
      }

      if (!apiBaseUrl) {
        if (isMounted) {
          setConfirmation({
            status: 'error',
            message: 'API base URL is not configured.',
          });
        }
        return;
      }

      // Mark that we're attempting confirmation
      confirmationInProgress.current = true;
      hasCalledApi.current = true;

      if (isMounted) {
        setConfirmation({ status: 'loading' });
      } else {
        console.warn('Component not mounted when trying to set loading state');
      }

      try {
        setShouldOfferResend(false);
        // URL decode the token in case it's encoded
        const decodedToken = token ? decodeURIComponent(token) : null;
        
        const requestBody = {
          email: emailToUse,
          token: decodedToken,
        };

        // Debug logging (remove in production)
        console.log('Confirming email with:', { 
          email: emailToUse, 
          tokenLength: decodedToken?.length,
          tokenPreview: decodedToken ? `${decodedToken.substring(0, 20)}...` : 'null',
          requestBody
        });

        const response = await fetch(`${apiBaseUrl}/accounts/confirm/verify/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Response status:', response.status, response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        let responseData: unknown = null;
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        try {
          responseData = responseText ? JSON.parse(responseText) : null;
          console.log('Parsed response data:', responseData);
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          console.error('Response text was:', responseText);
          if (isMounted) {
            setConfirmation({
              status: 'error',
              message: 'Invalid response from server. Please try again.',
            });
          }
          return;
        }

        if (!response.ok) {
          let errorMessage = 'Could not verify your account.';
          let offerResend = false;

          if (responseData && typeof responseData === 'object') {
            if ('error' in (responseData as Record<string, unknown>) && typeof (responseData as Record<string, unknown>).error === 'string') {
              errorMessage = (responseData as Record<string, string>).error;
            } else if ('detail' in responseData && typeof (responseData as Record<string, unknown>).detail === 'string') {
              errorMessage = String((responseData as Record<string, string>).detail);
            } else {
              const fieldErrors = Object.entries(responseData as Record<string, unknown>)
                .map(([field, value]) => {
                  if (Array.isArray(value)) {
                    return `${field}: ${value.join(', ')}`;
                  }
                  if (typeof value === 'string') {
                    return `${field}: ${value}`;
                  }
                  return null;
                })
                .filter(Boolean);

              if (fieldErrors.length > 0) {
                errorMessage = fieldErrors.join(' | ');
              } else if (responseText) {
                errorMessage = responseText;
              }
            }
          }

          const normalizedMessage = errorMessage.toLowerCase();
          if (
            response.status === 400 ||
            response.status === 404 ||
            normalizedMessage.includes('expired') ||
            normalizedMessage.includes('invalid')
          ) {
            offerResend = true;
          }

          console.error('Email confirmation failed:', { 
            status: response.status, 
            error: errorMessage, 
            responseData,
            requestBody: {
              email: emailToUse,
              tokenLength: decodedToken?.length,
              tokenPreview: decodedToken ? `${decodedToken.substring(0, 10)}...` : 'null'
            }
          });

          confirmationInProgress.current = false;
          if (isMounted) {
            setConfirmation({ status: 'error', message: errorMessage });
            setResendStatus(null);
            setShouldOfferResend(offerResend);
          }

          return;
        }

        // Log successful response for debugging
        console.log('✅ Email confirmation successful!', {
          responseStatus: response.status,
          responseData,
          hasAccessToken: responseData && typeof responseData === 'object' && 'access_token' in responseData,
          responseKeys: responseData && typeof responseData === 'object' ? Object.keys(responseData) : [],
          isMounted
        });

        // Always update state to success if response is OK, even if responseData is missing
        if (!responseData || typeof responseData !== 'object') {
          console.warn('Response data is missing or invalid, but status is OK. Setting success anyway.');
          if (isMounted) {
            setConfirmation({
              status: 'success',
              message: 'Your email has been confirmed successfully.',
            });
          }
          return;
        }

        if ('access_token' in responseData) {
          const accessToken = String((responseData as Record<string, unknown>).access_token);
          const refreshToken =
            'refresh_token' in responseData && typeof (responseData as Record<string, unknown>).refresh_token === 'string'
              ? String((responseData as Record<string, unknown>).refresh_token)
              : null;
          // user_id might be a string or UUID, handle both
          const userIdValue = (responseData as Record<string, unknown>).user_id;
          const userId = userIdValue ? String(userIdValue) : null;
          const expiresIn =
            'expires_in' in responseData && typeof (responseData as Record<string, unknown>).expires_in === 'number'
              ? Number((responseData as Record<string, unknown>).expires_in)
              : null;

          console.log('Establishing session with:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            hasUserId: !!userId,
            expiresIn
          });

          establishSession({
            accessToken,
            refreshToken,
            userId,
            expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
          });
        }

        const successMessage =
          'message' in responseData &&
          typeof (responseData as Record<string, unknown>).message === 'string'
            ? (responseData as Record<string, string>).message
            : 'Your email has been confirmed successfully.';

        console.log('Setting confirmation status to success', { isMounted, successMessage });
        
        // Update state immediately - use functional update to ensure it works
        console.log('Updating state to success now', { isMounted, successMessage });
        
        // Always update state, React will handle if component is unmounted
        setConfirmation((prevState) => {
          console.log('State update callback called', { prevState, newStatus: 'success' });
          return {
            status: 'success',
            message: successMessage,
          };
        });
        setShouldOfferResend(false);
        
        confirmationInProgress.current = false;
        
        // Double-check state was updated after a brief delay
        setTimeout(() => {
          console.log('Checking if state was updated...');
        }, 100);
      } catch (error) {
        console.error('Error during email confirmation:', error);
        confirmationInProgress.current = false;
        if (isMounted) {
          setConfirmation({
            status: 'error',
            message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
          });
        }
      }
    };

    // Only run confirmation if we have both token and email
    if (token && (email || emailInput.trim())) {
      confirmSignup();
    }

    return () => {
      isMounted = false;
    };
    // Only run when token or email changes, and only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email, emailInput]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleResendConfirmation = async () => {
    const emailToUse = email || emailInput.trim();
    if (!apiBaseUrl || !emailToUse) {
      setResendStatus({
        type: 'error',
        message: !apiBaseUrl ? 'API base URL is not configured.' : 'Email address missing for resend.',
      });
      return;
    }

    setIsResending(true);
    setResendStatus(null);

    try {
      const response = await fetch(`${apiBaseUrl}/accounts/confirm/resend/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToUse }),
      });

      let responseData: unknown = null;
      try {
        responseData = await response.json();
      } catch {
        // Ignore empty response bodies
      }

      if (!response.ok) {
        let message = 'Unable to resend confirmation email.';

        if (responseData && typeof responseData === 'object') {
          if ('error' in (responseData as Record<string, unknown>) && typeof (responseData as Record<string, unknown>).error === 'string') {
            message = (responseData as Record<string, string>).error;
          } else {
            const fieldErrors = Object.entries(responseData as Record<string, unknown>)
              .map(([field, value]) => {
                if (Array.isArray(value)) {
                  return `${field}: ${value.join(', ')}`;
                }
                if (typeof value === 'string') {
                  return `${field}: ${value}`;
                }
                return null;
              })
              .filter(Boolean);

            if (fieldErrors.length > 0) {
              message = fieldErrors.join(' | ');
            }
          }
        }

        setResendStatus({ type: 'error', message });
        return;
      }

      const message =
        responseData &&
        typeof responseData === 'object' &&
        'message' in responseData &&
        typeof (responseData as Record<string, unknown>).message === 'string'
          ? (responseData as Record<string, string>).message
          : "We've sent you another confirmation email. Please check your inbox.";

      setResendStatus({ type: 'success', message });
    } catch (error) {
      setResendStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong while resending the email.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-white pb-[80px] pt-[40px] lg:pb-[120px] lg:pt-[60px]">
      <div className="container-ellie">
        <div className="mx-auto max-w-[600px] rounded-[24px] border border-[#7964A0]/20 bg-white px-8 py-12 shadow-sm">
          <div className="text-center">
            <h1 className="font-nunito text-[32px] font-extrabold text-ellieBlack lg:text-[40px]">
              Confirming Your Account
            </h1>
            <p className="mt-3 font-nunito text-[18px] text-ellieGray">
              We’re finalizing your signup. This only takes a moment.
            </p>
          </div>

          <div className="mt-10">
            {confirmation.status === 'loading' && (
              <div className="rounded-[16px] border border-[#7964A0]/30 bg-[#7964A0]/5 px-6 py-5 text-center font-nunito text-[16px] text-ellieGray">
                Verifying your email, please wait...
              </div>
            )}

            {confirmation.status === 'success' && (
              <div className="space-y-6 text-center">
                <div className="rounded-[16px] border border-green-200 bg-green-50 px-6 py-5 font-nunito text-[16px] text-green-700">
                  {confirmation.message}
                </div>
                <p className="font-nunito text-[16px] text-ellieGray">
                  You can now continue to the dashboard or head to the login page. We’ve saved your session tokens locally, so you’ll stay signed in on this device.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={handleGoToLogin}
                    className="inline-flex items-center justify-center rounded-[12px] border border-ellieBlue px-6 py-3 font-nunito text-[16px] font-semibold text-ellieBlue transition hover:bg-ellieBlue/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue"
                  >
                    Go to Login
                  </button>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-[12px] bg-ellieBlue px-6 py-3 font-nunito text-[16px] font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue"
                  >
                    Open Dashboard
                  </Link>
                </div>
              </div>
            )}

            {confirmation.status === 'error' && (
              <div className="space-y-6 text-center">
                <div className="rounded-[16px] border border-red-200 bg-red-50 px-6 py-5 font-nunito text-[16px] text-red-600">
                  {confirmation.message}
                </div>
                {!email && (
                  <div className="space-y-3">
                    <label htmlFor="email-input" className="block text-left font-nunito text-[16px] font-semibold text-ellieBlack">
                      Email Address
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] font-nunito text-[16px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30"
                    />
                    <p className="text-left font-nunito text-[14px] text-ellieGray">
                      Please enter the email address you used to sign up.
                    </p>
                  </div>
                )}
                <div className="space-y-3 font-nunito text-[16px] text-ellieGray">
                  {shouldOfferResend ? (
                    <>
                      <p>Your confirmation link may be expired or invalid. Request a new one below.</p>
                      {(email || emailInput) && (
                        <p>
                          We can resend it to <span className="font-semibold text-ellieBlack">{email || emailInput}</span>.
                        </p>
                      )}
                    </>
                  ) : (
                    <p>Double-check the link in your email or request a new confirmation link.</p>
                  )}
                </div>
                {resendStatus && (
                  <div
                    className={`rounded-[12px] border px-5 py-3 font-nunito text-[15px] ${
                      resendStatus.type === 'success'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-600'
                    }`}
                  >
                    {resendStatus.message}
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={isResending || (!email && !emailInput.trim())}
                    className="inline-flex items-center justify-center rounded-[12px] bg-ellieBlue px-6 py-3 font-nunito text-[16px] font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResending ? 'Sending...' : 'Resend Email'}
                  </button>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center rounded-[12px] border border-ellieBlue px-6 py-3 font-nunito text-[16px] font-semibold text-ellieBlue transition hover:bg-ellieBlue/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue"
                  >
                    Return to Signup
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

