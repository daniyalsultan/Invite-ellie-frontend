import { useState, useEffect } from 'react';
import { DashboardLayout } from '../sidebar';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'CLARITY',
    name: 'Clarity',
    price: 10,
    description: 'Essential tools to capture and share meeting notes.',
    features: [
      'Up to 20 meetings / month',
      'Basic summaries & action items',
      'Slack export',
    ],
  },
  {
    id: 'INSIGHT',
    name: 'Insight',
    price: 20,
    description: 'Advanced summaries, exports, and team visibility.',
    features: [
      'Up to 60 meetings / month',
      'Enhanced summaries with highlights',
      'Slack + Notion exports',
    ],
  },
  {
    id: 'ALIGNMENT',
    name: 'Alignment',
    price: 30,
    description: 'Full collaboration, CRM exports, and priority support.',
    features: [
      'Unlimited meetings',
      'Advanced AI summaries & insights',
      'Slack + Notion + HubSpot exports',
      'Priority support',
    ],
  },
];

interface SubscriptionDetail {
  has_subscription: boolean;
  plan: string;
  status: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  current_period_start?: number;
  trial_end?: number | null;
  trial_start?: number | null;
  created?: number;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysUntil(timestamp: number): number {
  const now = Date.now();
  const target = timestamp * 1000;
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
}

export function SubscriptionsPage(): JSX.Element {
  const { profile } = useProfile();
  const { ensureFreshAccessToken } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subDetail, setSubDetail] = useState<SubscriptionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    if (!profile?.id) return;
    void fetchSubscriptionDetail();
  }, [profile?.id]);

  const fetchSubscriptionDetail = async () => {
    if (!apiBaseUrl) return;
    setLoadingDetail(true);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) return;
      const res = await fetch(`${apiBaseUrl}/accounts/stripe/subscription/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSubDetail(await res.json());
      }
    } catch {
      // Fall back to profile data
    } finally {
      setLoadingDetail(false);
    }
  };

  const currentPlanId = subDetail?.has_subscription
    ? subDetail.plan.toUpperCase()
    : (profile as any)?.subscription_plan?.toUpperCase() === 'FREE'
      ? null
      : (profile as any)?.subscription_plan?.toUpperCase() ?? null;

  const isActive = subDetail?.status === 'active' || subDetail?.status === 'trialing';
  const isTrial = subDetail?.status === 'trialing';
  const isCanceling = subDetail?.cancel_at_period_end === true;

  const handleSubscribe = async (planId: string) => {
    if (!profile?.id || !apiBaseUrl) {
      setError('Please login to choose a plan.');
      return;
    }

    try {
      setError(null);
      setLoadingPlan(planId);

      const accessToken = await ensureFreshAccessToken();
      if (!accessToken) {
        setError('Please login to choose a plan.');
        setLoadingPlan(null);
        return;
      }

      const response = await fetch(`${apiBaseUrl}/accounts/stripe/checkout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ plan: planId }),
      });

      if (!response.ok) {
        const text = await response.text();
        if (text.toLowerCase().includes('already subscribed to this plan')) {
          setError('You are already subscribed to this plan.');
          setLoadingPlan(null);
          return;
        }
        throw new Error(text || 'Failed to start checkout');
      }

      const data = await response.json();
      const url = data.url || data.checkout_url || data.session_url;
      if (url) {
        window.location.href = url;
      } else {
        setError('Checkout created, but no redirect URL returned.');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to start checkout';
      setError(message);
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    if (!apiBaseUrl) return;
    setLoadingPortal(true);
    setError(null);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) return;
      const res = await fetch(`${apiBaseUrl}/accounts/stripe/portal/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to open billing portal');
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open billing portal');
    } finally {
      setLoadingPortal(false);
    }
  };

  const activePlan = currentPlanId ? PLANS.find((p) => p.id === currentPlanId) : null;

  return (
    <DashboardLayout activeTab="/subscriptions">
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          <h1 className="font-spaceGrotesk text-2xl md:text-3xl lg:text-4xl font-bold text-ellieBlack mb-6">
            Subscriptions
          </h1>

          {!loadingDetail && isActive && activePlan && (
            <div className="mb-6 rounded-xl border border-ellieBlue/20 bg-ellieBlue/5 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isTrial ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 font-nunito text-xs font-semibold text-amber-700">
                        Free Trial
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 font-nunito text-xs font-semibold text-green-700">
                        Active
                      </span>
                    )}
                    {isCanceling && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 font-nunito text-xs font-semibold text-red-600">
                        Cancels at period end
                      </span>
                    )}
                    <h2 className="font-nunito text-lg font-bold text-ellieBlack">
                      {activePlan.name} Plan
                    </h2>
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className="font-nunito text-sm text-[#545454]">
                      ${activePlan.price}/month &middot; {activePlan.features[0]}
                    </p>

                    {isTrial && subDetail?.trial_end && (
                      <p className="font-nunito text-sm text-amber-700">
                        Trial ends {formatDate(subDetail.trial_end)} ({daysUntil(subDetail.trial_end)} days remaining)
                      </p>
                    )}

                    {!isTrial && subDetail?.current_period_end && !isCanceling && (
                      <p className="font-nunito text-sm text-[#7A86A1]">
                        Renews {formatDate(subDetail.current_period_end)}
                      </p>
                    )}

                    {isCanceling && subDetail?.current_period_end && (
                      <p className="font-nunito text-sm text-red-600">
                        Access until {formatDate(subDetail.current_period_end)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleManageBilling()}
                  disabled={loadingPortal}
                  className="shrink-0 rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 font-nunito text-sm font-semibold text-ellieBlack transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingPortal ? 'Opening...' : 'Manage Billing'}
                </button>
              </div>
            </div>
          )}

          {!loadingDetail && !isActive && (profile as any)?.subscription_plan !== 'free' && (profile as any)?.subscription_status === 'canceled' && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 font-nunito text-xs font-semibold text-gray-600">
                  Canceled
                </span>
                <p className="font-nunito text-sm text-[#545454]">
                  Your subscription has ended. Choose a plan below to resubscribe.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-nunito text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {PLANS.map((plan) => {
              const isCurrentPlan = currentPlanId === plan.id && isActive;
              const hasActiveSubscription = isActive && currentPlanId != null;

              let buttonText = 'Subscribe';
              let isDisabled = loadingPlan === plan.id;

              if (loadingPlan === plan.id) {
                buttonText = 'Redirecting...';
              } else if (isCurrentPlan) {
                buttonText = 'Current Plan';
                isDisabled = true;
              } else if (hasActiveSubscription && activePlan) {
                buttonText = plan.price > activePlan.price ? 'Upgrade' : 'Downgrade';
              }

              return (
                <div
                  key={plan.id}
                  className={`bg-white border-2 rounded-xl p-4 md:p-6 transition-shadow ${
                    isCurrentPlan
                      ? 'border-ellieBlue shadow-[0_0_0_1px_rgba(50,122,173,0.2)] shadow-lg'
                      : 'border-gray-200 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-nunito text-lg md:text-xl font-bold text-ellieBlack">
                        {plan.name}
                      </h3>
                      {isCurrentPlan && (
                        <span className="inline-flex items-center rounded-full bg-ellieBlue/10 px-2 py-0.5 font-nunito text-[11px] font-semibold text-ellieBlue">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="text-ellieBlue font-spaceGrotesk text-xl md:text-2xl font-bold">
                      ${plan.price}
                      <span className="text-sm text-ellieGray font-nunito font-semibold">/mo</span>
                    </span>
                  </div>
                  <p className="font-nunito text-sm text-ellieGray mb-4 leading-relaxed">
                    {plan.description}
                  </p>
                  <ul className="font-nunito text-sm text-ellieGray mb-5 space-y-1 list-disc list-inside">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isDisabled}
                    className={`w-full px-4 py-2 rounded-lg font-nunito text-sm font-semibold transition-opacity ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-ellieBlue text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
