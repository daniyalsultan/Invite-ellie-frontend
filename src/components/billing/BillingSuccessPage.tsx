import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';

export function BillingSuccessPage(): JSX.Element {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { isAuthenticated } = useAuth();
  const [hasShownSuccess, setHasShownSuccess] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Show success immediately and set up redirect
    setHasShownSuccess(true);

    // Auto-redirect to subscriptions page after 2 seconds
    const timer = setTimeout(() => {
      navigate('/subscriptions');
    }, 2000);

    setRedirectTimer(timer);

    // Cleanup on unmount
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isAuthenticated, navigate]);

  // Cleanup redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  return (
    <DashboardLayout activeTab="/subscriptions">
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          <div className="max-w-2xl mx-auto">
            {!hasShownSuccess ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-ellieBlue border-t-transparent mb-4"></div>
                <p className="font-nunito text-lg text-ellieGray">Processing your subscription...</p>
              </div>
            ) : (
              <div className="text-center py-12">
                {/* Success Icon */}
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                    <svg
                      className="w-12 h-12 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Success Message */}
                <h1 className="font-spaceGrotesk text-3xl md:text-4xl font-bold text-ellieBlack mb-4">
                  Payment Successful!
                </h1>
                <p className="font-nunito text-lg text-ellieGray mb-8">
                  Thank you for subscribing. Your subscription is now active and you have access to all premium features.
                </p>

                {/* Subscription Details */}
                {(profile as any)?.subscription_status === 'active' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-nunito text-base font-semibold text-green-800">
                        Subscription Active
                      </span>
                    </div>
                    <p className="font-nunito text-sm text-green-700">
                      You can now enjoy all the features of your plan.
                    </p>
                  </div>
                )}

                {/* Redirect Message */}
                <div className="mb-6">
                  <p className="font-nunito text-sm text-ellieGray">
                    Redirecting to subscriptions page in a moment...
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (redirectTimer) {
                        clearTimeout(redirectTimer);
                      }
                      navigate('/dashboard');
                    }}
                    className="px-6 py-3 rounded-lg bg-ellieBlue text-white font-nunito text-base font-semibold hover:opacity-90 transition-opacity"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (redirectTimer) {
                        clearTimeout(redirectTimer);
                      }
                      navigate('/subscriptions');
                    }}
                    className="px-6 py-3 rounded-lg bg-white border-2 border-ellieBlue text-ellieBlue font-nunito text-base font-semibold hover:bg-ellieBlue hover:text-white transition-colors"
                  >
                    View Subscriptions Now
                  </button>
                </div>

                {/* Help Text */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="font-nunito text-sm text-ellieGray">
                    Need help?{' '}
                    <a
                      href="mailto:support@inviteellie.ai"
                      className="text-ellieBlue hover:underline"
                    >
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

