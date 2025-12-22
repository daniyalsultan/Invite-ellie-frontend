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
      'Email/PDF sharing',
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

export function SubscriptionsPage(): JSX.Element {
  const { profile } = useProfile();
  const { ensureFreshAccessToken } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  // Get current plan from sessionStorage (stored when user subscribes)
  // or determine from subscription error
  useEffect(() => {
    const profileData = profile as any;
    
    // Only check if user has an active subscription
    if (!profileData?.stripe_subscription_id || profileData?.subscription_status !== 'active') {
      setCurrentPlanId(null);
      // Clear stored plan if no subscription
      sessionStorage.removeItem('current_subscription_plan');
      return;
    }

    // First, try to get from sessionStorage (stored when subscribing)
    const storedPlan = sessionStorage.getItem('current_subscription_plan');
    if (storedPlan && PLANS.some(p => p.id === storedPlan)) {
      setCurrentPlanId(storedPlan);
      return;
    }

    // If not in sessionStorage, we can't determine it without backend help
    // For now, set to null - user can still switch plans
    // Backend will prevent subscribing to the same plan
    setCurrentPlanId(null);
  }, [profile]);

  const handleSubscribe = async (planId: string) => {
    if (!profile?.id) {
      setError('Please login to choose a plan.');
      return;
    }

    try {
      setError(null);
      setLoadingPlan(planId);
      
      // Get fresh access token for authentication
      const accessToken = await ensureFreshAccessToken();
      if (!accessToken) {
        setError('Please login to choose a plan.');
        setLoadingPlan(null);
        return;
      }
      
      // Use getApiBaseUrl() to get the proxy path (/api) which handles CORS automatically
      const apiBaseUrl = getApiBaseUrl();
      if (!apiBaseUrl) {
        setError('API base URL is not configured. Please check your environment variables.');
        setLoadingPlan(null);
        return;
      }

      // Construct the URL using the proxy path
      // In development: /api/accounts/stripe/checkout/ -> proxied to https://api.stage.inviteellie.ai/api/accounts/stripe/checkout/
      // In production: /api/accounts/stripe/checkout/ -> handled by Vercel rewrite or reverse proxy
      const checkoutUrl = `${apiBaseUrl}/accounts/stripe/checkout/`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      };
      
      const response = await fetch(checkoutUrl, {
        method: 'POST',
        headers,
        credentials: 'include', // Include cookies for session-based auth if needed
        body: JSON.stringify({ plan: planId }),
      });

      if (!response.ok) {
        const text = await response.text();
        const errorText = text.toLowerCase();
        
        // If error says "already subscribed to this plan", this is the current plan
        if (errorText.includes('already subscribed to this plan')) {
          setCurrentPlanId(planId);
          sessionStorage.setItem('current_subscription_plan', planId);
          setError('You are already subscribed to this plan.');
          setLoadingPlan(null);
          return;
        }
        
        throw new Error(text || 'Failed to start checkout');
      }

      const data = await response.json();
      const url = data.url || data.checkout_url || data.session_url;
      if (url) {
        // Store the plan being subscribed to in sessionStorage
        // This helps us identify the current plan after successful subscription
        sessionStorage.setItem('current_subscription_plan', planId);
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
                {(() => {
                  const profileData = profile as any;
                  const hasActiveSubscription = profileData?.stripe_subscription_id && profileData?.subscription_status === 'active';
                  const isCurrentPlan = currentPlanId === plan.id;
                  
                  // Disable if it's the current plan or if loading
                  const isDisabled = loadingPlan === plan.id || (hasActiveSubscription && isCurrentPlan);
                  
                  // Determine button text
                  let buttonText = 'Subscribe';
                  if (loadingPlan === plan.id) {
                    buttonText = 'Redirecting...';
                  } else if (hasActiveSubscription && isCurrentPlan) {
                    buttonText = 'Current Plan';
                  } else if (hasActiveSubscription && !isCurrentPlan) {
                    // Show upgrade/downgrade based on price comparison
                    const currentPlan = PLANS.find(p => p.id === currentPlanId);
                    if (currentPlan) {
                      buttonText = plan.price > currentPlan.price ? 'Upgrade' : 'Downgrade';
                    } else {
                      buttonText = 'Switch Plan';
                    }
                  }
                  
                  return (
                    <button
                      type="button"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isDisabled}
                      className="w-full px-4 py-2 rounded-lg bg-ellieBlue text-white font-nunito text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {buttonText}
                    </button>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

