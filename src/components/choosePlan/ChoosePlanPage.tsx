import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

interface PlanOption {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

const PLANS: PlanOption[] = [
  {
    id: 'CLARITY',
    name: 'Clarity',
    price: 10,
    description: 'Essential tools to capture and share meeting notes.',
    features: ['Up to 20 meetings / month', 'Basic summaries & action items', 'Slack export'],
  },
  {
    id: 'INSIGHT',
    name: 'Insight',
    price: 20,
    description: 'Advanced summaries, exports, and team visibility.',
    features: ['Up to 60 meetings / month', 'Enhanced summaries with highlights', 'Slack + Notion exports'],
  },
  {
    id: 'ALIGNMENT',
    name: 'Alignment',
    price: 30,
    description: 'Full collaboration, CRM exports, and priority support.',
    features: ['Unlimited meetings', 'Advanced AI summaries & insights', 'Slack + Notion + HubSpot exports', 'Priority support'],
  },
];

export function ChoosePlanPage(): JSX.Element {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { ensureFreshAccessToken } = useAuth();
  const { isLoading: isProfileLoading } = useProfile();
  const apiBaseUrl = getApiBaseUrl();

  const handleCheckout = async (trial: boolean) => {
    if (!selectedPlan || !apiBaseUrl) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }

      const checkoutResponse = await fetch(`${apiBaseUrl}/accounts/stripe/checkout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: selectedPlan, trial }),
      });

      if (!checkoutResponse.ok) {
        const data = await checkoutResponse.json().catch(() => null);
        throw new Error(data?.error || 'Unable to start checkout. Please try again.');
      }

      const checkoutData = await checkoutResponse.json();
      const checkoutUrl = checkoutData.url || checkoutData.checkout_url || checkoutData.session_url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      throw new Error('Unable to start checkout. Please try again.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);

  return (
    <div className="ie-page flex min-h-screen items-center justify-center py-[56px] lg:py-[72px]">
      <div className="ie-wrap max-w-[1000px]">
        <div className="text-center">
          <h1 className="ie-title">
            Choose Your Plan
          </h1>
          <p className="ie-lede mx-auto mt-4 max-w-[540px]">
            Select a plan to get started with Ellie and unlock your meeting superpowers.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
              disabled={isSubmitting}
              aria-pressed={selectedPlan === plan.id}
              className={`ie-card flex flex-col p-6 text-left transition-all focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ie-blue disabled:cursor-not-allowed disabled:opacity-60 lg:p-7 ${
                selectedPlan === plan.id
                  ? 'bg-ie-tBlue/50 ring-2 ring-ie-blue'
                  : 'hover:-translate-y-0.5 hover:bg-ie-bgAlt'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="ie-subtitle">{plan.name}</span>
                <span className="font-display text-[1.75rem] font-bold leading-none tracking-[-0.03em] text-ie-indigo">
                  ${plan.price}<span className="font-dmSans text-[0.9rem] font-normal tracking-normal text-ie-muted">/mo</span>
                </span>
              </div>
              <p className="mt-3 text-[0.95rem] leading-[1.5] text-ie-muted">{plan.description}</p>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[0.93rem] leading-[1.45] text-ie-text">
                    <span className="font-bold text-ie-green">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
              {selectedPlan === plan.id && (
                <div className="mt-5 flex items-center gap-2 text-[0.93rem] font-semibold text-ie-blue">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ie-blue text-[12px] text-white">
                    &#10003;
                  </span>
                  Selected
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-[440px]">
          <button
            type="button"
            onClick={() => handleCheckout(false)}
            disabled={!selectedPlan || isSubmitting}
            className="ie-btn-primary w-full py-[17px] text-[1.05rem] disabled:opacity-40"
          >
            {isSubmitting ? 'Redirecting to checkout...' : 'Continue to Payment'}
          </button>

          <div className="ie-divider my-5">or</div>

          <button
            type="button"
            onClick={() => handleCheckout(true)}
            disabled={!selectedPlan || isSubmitting}
            className="ie-btn-secondary w-full whitespace-normal py-[17px] text-center text-[1.05rem] leading-tight disabled:opacity-40"
          >
            {isSubmitting
              ? 'Redirecting...'
              : selectedPlanData
                ? `Start 14-Day Free Trial — ${selectedPlanData.name}`
                : 'Start 14-Day Free Trial'}
          </button>
          <p className="mt-3 text-center text-[0.85rem] leading-[1.5] text-ie-muted">
            No charge for 14 days. You can cancel anytime before your trial ends to avoid being charged.
          </p>

          {errorMessage && (
            <div className="ie-error mt-4" role="alert">
              {errorMessage}
            </div>
          )}

          {isProfileLoading && (
            <p className="mt-4 text-center text-[0.95rem] text-ie-muted">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
