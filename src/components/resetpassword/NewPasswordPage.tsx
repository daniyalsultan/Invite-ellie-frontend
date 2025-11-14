import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import frameImage from '../../assets/Frame.png';

export function NewPasswordPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const recoveryToken = useMemo(() => {
    const tokenParam = searchParams.get('token');
    return tokenParam ? tokenParam.trim() : '';
  }, [searchParams]);

  const showRecoveryNotice = searchParams.get('notice') === 'recovery';

  const initialError = useMemo(() => {
    const errorParam = searchParams.get('error');
    if (!errorParam) {
      return null;
    }
    try {
      return decodeURIComponent(errorParam);
    } catch {
      return errorParam;
    }
  }, [searchParams]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!apiBaseUrl) {
      setErrorMessage('API base URL is not configured.');
      return;
    }

    if (!recoveryToken) {
      setErrorMessage('Your recovery link is missing necessary details. Please request a new password reset email.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/accounts/password/reset/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          token: recoveryToken,
        }),
      });

      let responseData: unknown = null;
      try {
        responseData = await response.json();
      } catch {
        // ignore empty body
      }

      if (!response.ok) {
        let message = 'Unable to update your password.';

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

      const success =
        responseData &&
        typeof responseData === 'object' &&
        'message' in responseData &&
        typeof (responseData as Record<string, unknown>).message === 'string'
          ? (responseData as Record<string, string>).message
          : 'Password updated successfully.';

      setSuccessMessage(success);
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
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
              src={frameImage}
              alt="Secure account illustration"
              className="h-auto w-full max-w-[250px] object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-center font-nunito text-[24px] font-extrabold text-ellieBlack lg:text-[32px]">
            Let's secure your account
          </h1>

          {/* Instructional Text */}
          <p className="mt-3 text-center font-nunito text-[16px] leading-[1.5] text-ellieBlack lg:text-[18px]">
            Create a new password to regain access to your Ellie.
          </p>

          {showRecoveryNotice && (
            <div className="mt-4 rounded-[12px] border border-[#7964A0]/30 bg-[#7964A0]/10 px-5 py-3 font-nunito text-[15px] text-ellieGray">
              We opened this page from your recovery link. Set a new password below and we'll finish the process for you
              automatically.
            </div>
          )}

          {/* New Password Form */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] pr-12 font-nunito text-[18px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30"
                disabled={isSubmitting || !!successMessage}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ellieGray hover:text-ellieBlack"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a9.984 9.984 0 01.908-5.858m0 0L5.5 5.5m8.532 8.532L19 19M12 12l.01.01M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] pr-12 font-nunito text-[18px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30"
                disabled={isSubmitting || !!successMessage}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ellieGray hover:text-ellieBlack"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a9.984 9.984 0 01.908-5.858m0 0L5.5 5.5m8.532 8.532L19 19M12 12l.01.01M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="rounded-[12px] border border-red-200 bg-red-50 px-5 py-3 font-nunito text-[16px] text-red-600">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="space-y-3">
                <div className="rounded-[12px] border border-green-200 bg-green-50 px-5 py-3 font-nunito text-[16px] text-green-700">
                  {successMessage}
                </div>
                <p className="text-center font-nunito text-[15px] text-ellieGray">
                  You will be redirected to the login page shortly. If nothing happens,{' '}
                  <Link to="/login" className="font-semibold text-ellieBlue underline">
                    click here
                  </Link>
                  .
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !!successMessage || !recoveryToken}
              className="mt-2 inline-flex w-full items-center justify-center rounded-[12px] bg-ellieBlue px-[40px] py-[16px] font-nunito text-[18px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue disabled:cursor-not-allowed disabled:opacity-60 lg:text-[20px]"
            >
              {isSubmitting ? 'Updating password...' : 'Continue and Login'}
            </button>
          </form>

          <p className="mt-6 text-center font-nunito text-[15px] text-ellieGray">
            Link expired or not working?{' '}
            <Link to="/forgot-password" className="font-semibold text-ellieBlue underline">
              Request a new reset email
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
