import { useState } from 'react';
import { DashboardLayout } from '../sidebar';
import { useProfile } from '../../context/ProfileContext';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'clarity',
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
    id: 'insight',
    name: 'Insight',
    price: 20,
    description: 'Advanced summaries, exports, and team visibility.',
    features: [
      'Up to 60 meetings / month',
      'Enhanced summaries with highlights',
      'Slack + Notion exports',
      'Email/PDF sharing',
    ],
  },
  {
    id: 'alignment',
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

export function SubscriptionsPage(): JSX.Element {
  const { profile } = useProfile();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!profile?.id) {
      setError('Please login to choose a plan.');
      return;
    }

    try {
      setError(null);
      setLoadingPlan(planId);
      const token = import.meta.env.VITE_STRIPE_CHECKOUT_TOKEN;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch('https://api.stage.inviteellie.ai/api/accounts/stripe/checkout/', {
        method: 'POST',
        headers,
        body: JSON.stringify({ plan: planId }),
      });

      if (!response.ok) {
        const text = await response.text();
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

  return (
    <DashboardLayout activeTab="/subscriptions">
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          <h1 className="font-spaceGrotesk text-2xl md:text-3xl lg:text-4xl font-bold text-ellieBlack mb-6">
            Subscriptions
          </h1>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-nunito text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-nunito text-lg md:text-xl font-bold text-ellieBlack">{plan.name}</h3>
                  <span className="text-ellieBlue font-spaceGrotesk text-xl md:text-2xl font-bold">
                    ${plan.price}
                    <span className="text-sm text-ellieGray font-nunito font-semibold">/mo</span>
                  </span>
                </div>
                <p className="font-nunito text-sm text-ellieGray mb-4 leading-relaxed">{plan.description}</p>
                <ul className="font-nunito text-sm text-ellieGray mb-5 space-y-1 list-disc list-inside">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className="w-full px-4 py-2 rounded-lg bg-ellieBlue text-white font-nunito text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingPlan === plan.id ? 'Redirecting...' : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

