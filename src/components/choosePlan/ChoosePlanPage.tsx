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
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-[60px]">
      <div className="w-full max-w-[900px]">
        <div className="text-center">
          <h1 className="font-nunito text-[32px] font-extrabold text-ellieBlack lg:text-[45px]">
            Choose Your Plan
          </h1>
          <p className="mx-auto mt-3 max-w-[520px] font-nunito text-[18px] leading-[1.5] text-[#545454] lg:text-[22px]">
            Select a plan to get started with Ellie and unlock your meeting superpowers.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
              disabled={isSubmitting}
              className={`flex flex-col rounded-[18px] border-2 p-6 text-left transition-all ${
                selectedPlan === plan.id
                  ? 'border-ellieBlue bg-ellieBlue/5 shadow-[0_15px_35px_rgba(50,122,173,0.2)]'
                  : 'border-[#E5E7EB] bg-white hover:border-ellieBlue/40 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-nunito text-[20px] font-bold text-ellieBlack">{plan.name}</span>
                <span className="font-spaceGrotesk text-[24px] font-bold text-ellieBlue">
                  ${plan.price}<span className="text-[14px] font-normal text-[#7A86A1]">/mo</span>
                </span>
              </div>
              <p className="mt-2 font-nunito text-[15px] leading-snug text-[#545454]">{plan.description}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 font-nunito text-[14px] text-[#545454]">
                    <span className="mt-0.5 text-ellieBlue">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
              {selectedPlan === plan.id && (
                <div className="mt-4 flex items-center gap-2 font-nunito text-[14px] font-bold text-ellieBlue">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ellieBlue text-[12px] text-white">
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
            className="inline-flex w-full items-center justify-center rounded-[12px] bg-ellieBlue px-[40px] py-[16px] font-nunito text-[18px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue disabled:cursor-not-allowed disabled:opacity-40 lg:text-[20px]"
          >
            {isSubmitting ? 'Redirecting to checkout...' : 'Continue to Payment'}
          </button>

          <div className="relative my-5 flex items-center">
            <div className="flex-1 border-t border-[#E5E7EB]" />
            <span className="px-4 font-nunito text-[14px] text-[#7A86A1]">or</span>
            <div className="flex-1 border-t border-[#E5E7EB]" />
          </div>

          <button
            type="button"
            onClick={() => handleCheckout(true)}
            disabled={!selectedPlan || isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-[12px] border-2 border-ellieBlue bg-white px-[40px] py-[14px] font-nunito text-[17px] font-extrabold text-ellieBlue transition hover:bg-ellieBlue/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting
              ? 'Redirecting...'
              : selectedPlanData
                ? `Start 14-Day Free Trial — ${selectedPlanData.name}`
                : 'Start 14-Day Free Trial'}
          </button>
          <p className="mt-2 text-center font-nunito text-[13px] text-[#7A86A1]">
            No charge for 14 days. Cancel anytime.
          </p>

          {errorMessage && (
            <div className="mt-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 font-nunito text-[15px] text-red-600">
              {errorMessage}
            </div>
          )}

          {isProfileLoading && (
            <p className="mt-4 text-center font-nunito text-[15px] text-ellieGray">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
