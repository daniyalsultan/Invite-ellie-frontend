import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

export function BillingSuccessPage(): JSX.Element {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useProfile();
  const { isAuthenticated, ensureFreshAccessToken } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'transitioning'>('processing');
  const pollCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFirstLogin = profile?.first_login === true;
  const hasPaidPlan =
    profile?.subscription_plan != null &&
    profile.subscription_plan !== '' &&
    profile.subscription_plan !== 'free';

  const isFirstLoginRef = useRef(isFirstLogin);
  isFirstLoginRef.current = isFirstLogin;

  const navigateNext = () => {
    if (isFirstLoginRef.current) {
      navigate('/setup-profile', { replace: true });
    } else {
      navigate('/subscriptions', { replace: true });
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (hasPaidPlan) {
      setStatus('success');
      return;
    }

    const poll = async () => {
      pollCountRef.current += 1;
      try {
        const token = await ensureFreshAccessToken();
        if (token) {
          const apiUrl = getApiBaseUrl();
          if (apiUrl) {
            await fetch(`${apiUrl}/accounts/stripe/subscription/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }
      } catch {
        // ignore — the fetch triggers backend-side sync
      }
      await refreshProfile();
    };

    const intervalId = setInterval(poll, 2000);

    const fallbackTimer = setTimeout(() => {
      clearInterval(intervalId);
      setStatus('success');
    }, 30000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(fallbackTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (hasPaidPlan && status === 'processing') {
      setStatus('success');
    }
  }, [hasPaidPlan, status]);

  useEffect(() => {
    if (status !== 'success') return;

    if (isFirstLoginRef.current) {
      timerRef.current = setTimeout(() => setStatus('transitioning'), 2000);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }

    timerRef.current = setTimeout(() => navigateNext(), 3000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [status]);

  useEffect(() => {
    if (status !== 'transitioning') return;
    timerRef.current = setTimeout(() => navigateNext(), 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [status]);

  const planName = profile?.subscription_plan
    ? profile.subscription_plan.charAt(0).toUpperCase() + profile.subscription_plan.slice(1)
    : null;

  return (
    <DashboardLayout activeTab="/subscriptions">
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          <div className="max-w-2xl mx-auto">
            {status === 'processing' ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-ellieBlue border-t-transparent mb-4"></div>
                <h1 className="font-spaceGrotesk text-2xl font-bold text-ellieBlack mb-2">
                  Activating your subscription...
                </h1>
                <p className="font-nunito text-lg text-ellieGray">
                  This usually takes just a few seconds.
                </p>
              </div>
            ) : status === 'transitioning' ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-ellieBlue border-t-transparent mb-6"></div>
                <h1 className="font-spaceGrotesk text-2xl md:text-3xl font-bold text-ellieBlack mb-3">
                  Starting your profile setup...
                </h1>
                <p className="font-nunito text-lg text-ellieGray">
                  Just a few more steps to get Ellie ready for you.
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <h1 className="font-spaceGrotesk text-3xl md:text-4xl font-bold text-ellieBlack mb-4">
                  You're all set!
                </h1>
                <p className="font-nunito text-lg text-ellieGray mb-8">
                  {planName
                    ? `Your ${planName} plan is now active.`
                    : 'Your subscription is now active.'}
                  {' '}Enjoy all your premium features.
                </p>

                {!isFirstLogin && (
                  <>
                    <div className="mb-6">
                      <p className="font-nunito text-sm text-ellieGray">
                        Redirecting to your subscriptions...
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (timerRef.current) clearTimeout(timerRef.current);
                          navigate('/subscriptions', { replace: true });
                        }}
                        className="px-6 py-3 rounded-lg bg-ellieBlue text-white font-nunito text-base font-semibold hover:opacity-90 transition-opacity"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  </>
                )}

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="font-nunito text-sm text-ellieGray">
                    Need help?{' '}
                    <a href="mailto:support@inviteellie.ai" className="text-ellieBlue hover:underline">
                      Contact our support team
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
