import { useState } from 'react';
import forgetPasswordImage from '../../assets/forgetpassword.png';

export function ResetPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

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
    <div className="bg-white pb-[80px] pt-[40px] lg:pb-[120px] lg:pt-[60px]">
      <div className="container-ellie flex justify-center">
        <div className="w-full max-w-[500px]">
          {/* Illustrative Graphic */}
          <div className="mb-8 flex justify-center">
            <img
              src={forgetPasswordImage}
              alt="Forgot password illustration"
              className="h-auto w-full max-w-[250px] object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-center font-nunito text-[32px] font-extrabold text-ellieBlack lg:text-[45px]">
            Reset your password
          </h1>

          {/* Instructional Text */}
          <p className="mt-3 text-center font-nunito text-[18px] leading-[1.5] text-ellieBlack lg:text-[22px]">
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
                className="w-full rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] font-nunito text-[18px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30"
              />
            </div>

            {errorMessage && (
              <div className="rounded-[12px] border border-red-200 bg-red-50 px-5 py-3 font-nunito text-[16px] text-red-600">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="rounded-[12px] border border-green-200 bg-green-50 px-5 py-3 font-nunito text-[16px] text-green-700">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex w-full items-center justify-center rounded-[12px] bg-ellieBlue px-[40px] py-[16px] font-nunito text-[18px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue disabled:cursor-not-allowed disabled:opacity-60 lg:text-[20px]"
            >
              {isSubmitting ? 'Sending reset link...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
