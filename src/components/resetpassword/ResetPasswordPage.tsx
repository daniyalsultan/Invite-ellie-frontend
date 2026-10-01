import { useState } from 'react';
import forgetPasswordImage from '../../assets/forgetpassword.png';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

export function ResetPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiBaseUrl = getApiBaseUrl();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!apiBaseUrl) {
      setErrorMessage('API base URL is not configured.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/accounts/password/reset/`, {
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
        // ignore empty responses
      }

      if (!response.ok) {
        let message = 'Unable to send password reset email.';

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

        setErrorMessage(message);
        return;
      }

      const message =
        responseData &&
        typeof responseData === 'object' &&
        'message' in responseData &&
        typeof (responseData as Record<string, unknown>).message === 'string'
          ? (responseData as Record<string, string>).message
          : 'Check your inbox for a secure link to reset your password.';

      setSuccessMessage(message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ie-page relative pb-[80px] pt-[32px] lg:pb-[110px] lg:pt-[56px]">
      <div className="ie-wrap flex justify-center">
        <div className="ie-card w-full max-w-[520px] p-8 md:p-10">
          {/* Illustrative Graphic */}
          <div className="mb-8 flex justify-center">
            <img
              src={forgetPasswordImage}
              alt="Forgot password illustration"
              className="h-auto w-full max-w-[220px] object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="ie-title text-center">
            Reset your password
          </h1>

          {/* Instructional Text */}
          <p className="ie-lede mt-4 text-center">
            Enter your email to receive a secure reset link.
          </p>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="ie-input"
              />
            </div>

            {errorMessage && (
              <div className="ie-error" role="alert">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="ie-success" role="status">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="ie-btn-primary mt-2 w-full py-[17px] text-[1.05rem]"
            >
              {isSubmitting ? 'Sending reset link...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
