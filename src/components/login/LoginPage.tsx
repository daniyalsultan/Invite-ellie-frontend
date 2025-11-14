import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import groupImage from '../../assets/Group 41000.png';
import { useAuth } from '../../context/AuthContext';

export function LoginPage(): JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSSOLoading, setIsSSOLoading] = useState<'google' | 'microsoft' | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    setIsSubmitting(true);
    try {
      await login({ email, password, rememberMe });
      if (!rememberMe) {
        try {
          sessionStorage.setItem('ellie_last_login_email', email);
        } catch {
          /* ignore */
        }
      }
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!apiBaseUrl) {
      setErrorMessage('API base URL is not configured.');
      return;
    }

    setIsSSOLoading('google');
    setErrorMessage(null);

    try {
      // GET /api/accounts/sso/{provider}/ - No headers needed for GET request
      const response = await fetch(`${apiBaseUrl}/accounts/sso/google/`, {
        method: 'GET',
      });

      let responseData: unknown = null;
      try {
        responseData = await response.json();
      } catch {
        // Ignore JSON parsing errors
      }

      if (!response.ok) {
        let message = 'Unable to initiate Google sign-in.';
        if (responseData && typeof responseData === 'object' && 'error' in responseData) {
          message = typeof responseData.error === 'string' ? responseData.error : message;
        }
        setErrorMessage(message);
        setIsSSOLoading(null);
        return;
      }

      if (
        responseData &&
        typeof responseData === 'object' &&
        'url' in responseData &&
        typeof responseData.url === 'string'
      ) {
        // Redirect to Google OAuth URL
        window.location.href = responseData.url;
      } else {
        setErrorMessage('Invalid response from server.');
        setIsSSOLoading(null);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setIsSSOLoading(null);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (!apiBaseUrl) {
      setErrorMessage('API base URL is not configured.');
      return;
    }

    setIsSSOLoading('microsoft');
    setErrorMessage(null);

    try {
      // GET /api/accounts/sso/{provider}/ - No headers needed for GET request
      const response = await fetch(`${apiBaseUrl}/accounts/sso/microsoft/`, {
        method: 'GET',
      });

      let responseData: unknown = null;
      try {
        responseData = await response.json();
      } catch {
        // Ignore JSON parsing errors
      }

      if (!response.ok) {
        let message = 'Unable to initiate Microsoft sign-in.';
        if (responseData && typeof responseData === 'object' && 'error' in responseData) {
          message = typeof responseData.error === 'string' ? responseData.error : message;
        }
        setErrorMessage(message);
        setIsSSOLoading(null);
        return;
      }

      if (
        responseData &&
        typeof responseData === 'object' &&
        'url' in responseData &&
        typeof responseData.url === 'string'
      ) {
        // Redirect to Microsoft OAuth URL
        window.location.href = responseData.url;
      } else {
        setErrorMessage('Invalid response from server.');
        setIsSSOLoading(null);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setIsSSOLoading(null);
    }
  };

  return (
    <div className="bg-white pb-[80px] pt-[40px] lg:pb-[120px] lg:pt-[60px]">
      <div className="container-ellie">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-[60px]">
          {/* Left Side - Login Form */}
          <div className="w-full">
            <h1 className="font-nunito text-[32px] font-extrabold text-ellieBlack lg:text-[45px]">
              Login
            </h1>
            <p className="mt-3 font-nunito text-[18px] leading-[1.5] text-ellieGray lg:text-[22px]">
              Pick up right where you left off. Ellie remembers your meetings, notes, and decisions.
            </p>

            <div className="mt-8 flex flex-col gap-4 lg:flex-row">
              {/* Quick Login Buttons */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSSOLoading !== null || isSubmitting}
                className="flex w-full lg:flex-1 items-center justify-center gap-3 rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] font-nunito text-[18px] font-semibold text-ellieBlack transition hover:bg-[rgba(121,100,160,0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {isSSOLoading === 'google' ? 'Redirecting...' : 'Login with Google'}
              </button>

              <button
                type="button"
                onClick={handleMicrosoftLogin}
                disabled={isSSOLoading !== null || isSubmitting}
                className="flex w-full lg:flex-1 items-center justify-center gap-3 rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] font-nunito text-[18px] font-semibold text-ellieBlack transition hover:bg-[rgba(121,100,160,0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-5 w-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h10.556v10.556H0V0z" fill="#F25022"/>
                  <path d="M12.444 0H23v10.556H12.444V0z" fill="#7FBA00"/>
                  <path d="M0 12.444h10.556V23H0V12.444z" fill="#00A4EF"/>
                  <path d="M12.444 12.444H23V23H12.444V12.444z" fill="#FFB900"/>
                </svg>
                {isSSOLoading === 'microsoft' ? 'Redirecting...' : 'Login with Microsoft'}
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-[#7964A0]/30"></div>
              <span className="font-nunito text-[16px] text-ellieGray">or</span>
              <div className="h-[1px] flex-1 bg-[#7964A0]/30"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] font-nunito text-[18px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] pr-12 font-nunito text-[18px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ellieGray hover:text-ellieBlack"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-5 w-5 rounded border-[#7964A0] text-ellieBlue focus:ring-2 focus:ring-ellieBlue/30"
                  />
                  <label htmlFor="remember" className="font-nunito text-[16px] text-ellieGray">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/reset-password"
                  className="font-nunito text-[16px] font-semibold text-ellieBlue underline decoration-transparent transition hover:decoration-current"
                >
                  Forgot Password?
                </Link>
              </div>

              {errorMessage && (
                <div className="rounded-[12px] border border-red-200 bg-red-50 px-5 py-3 font-nunito text-[16px] text-red-600">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex w-full items-center justify-center rounded-[12px] bg-ellieBlue px-[40px] py-[16px] font-nunito text-[18px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue disabled:cursor-not-allowed disabled:opacity-60 lg:text-[20px]"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="mt-6 text-center font-nunito text-[16px] text-ellieGray">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-ellieBlue underline decoration-transparent transition hover:decoration-current">
                Sign up
              </Link>
            </p>
          </div>

          {/* Right Side - Image */}
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <img
              src={groupImage}
              alt="Ellie dashboard preview"
              className="w-full h-auto max-w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}