import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type ConfirmationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

export function ConfirmSignupPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const { establishSession } = useAuth();

  const { token, email } = useMemo(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    return {
      token: tokenParam ? tokenParam.trim() : null,
      email: emailParam ? emailParam.trim() : null,
    };
  }, [searchParams]);

  const [confirmation, setConfirmation] = useState<ConfirmationState>({ status: 'idle' });
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!token || !email) {
      navigate('/signup', {
        replace: true,
        state: {
          confirmationNotice: 'Please complete the signup process to receive a valid confirmation link.',
        },
      });
    }
  }, [token, email, navigate]);

  useEffect(() => {
    let isMounted = true;

    const confirmSignup = async () => {
      if (!token || !email) {
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

      if (isMounted) {
        setConfirmation({ status: 'loading' });
      }

      try {
        const response = await fetch(`${apiBaseUrl}/accounts/confirm/verify/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            token,
          }),
        });

        let responseData: unknown = null;
        try {
          responseData = await response.json();
        } catch {
          // Ignore JSON parsing errors on empty response bodies
        }

        if (!response.ok) {
          let errorMessage = 'Could not verify your account.';

          if (responseData && typeof responseData === 'object') {
            if ('error' in (responseData as Record<string, unknown>) && typeof (responseData as Record<string, unknown>).error === 'string') {
              errorMessage = (responseData as Record<string, string>).error;
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
              }
            }
          }

          if (isMounted) {
            setConfirmation({ status: 'error', message: errorMessage });
            setResendStatus(null);
          }

          return;
        }

        if (
          responseData &&
          typeof responseData === 'object' &&
          'access_token' in responseData &&
          typeof (responseData as Record<string, unknown>).access_token === 'string'
        ) {
          const accessToken = String((responseData as Record<string, unknown>).access_token);
          const refreshToken =
            'refresh_token' in responseData && typeof (responseData as Record<string, unknown>).refresh_token === 'string'
              ? String((responseData as Record<string, unknown>).refresh_token)
              : null;
          const userId =
            'user_id' in responseData && typeof (responseData as Record<string, unknown>).user_id === 'string'
              ? String((responseData as Record<string, unknown>).user_id)
              : null;
          const expiresIn =
            'expires_in' in responseData && typeof (responseData as Record<string, unknown>).expires_in === 'number'
              ? Number((responseData as Record<string, unknown>).expires_in)
              : null;

          establishSession({
            accessToken,
            refreshToken,
            userId,
            expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
          });
        }

        const successMessage =
          responseData &&
          typeof responseData === 'object' &&
          'message' in responseData &&
          typeof (responseData as Record<string, unknown>).message === 'string'
            ? (responseData as Record<string, string>).message
            : 'Your email has been confirmed successfully.';

        if (isMounted) {
          setConfirmation({
            status: 'success',
            message: successMessage,
          });
        }
      } catch (error) {
        if (isMounted) {
          setConfirmation({
            status: 'error',
            message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
          });
        }
      }
    };

    confirmSignup();

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl, email, token]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleResendConfirmation = async () => {
    if (!apiBaseUrl || !email) {
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
        body: JSON.stringify({ email }),
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
                <div className="space-y-3 font-nunito text-[16px] text-ellieGray">
                  <p>Double-check the link in your email or request a new confirmation link.</p>
                  {email && (
                    <p>
                      We can resend it to <span className="font-semibold text-ellieBlack">{email}</span>.
                    </p>
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
                    disabled={isResending || !email}
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

