'use client';

import { useState } from 'react';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/subscription';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { CheckIcon, StarIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface SubscriptionPlansProps {
  currentPlanId?: string;
  onPlanSelect?: (plan: SubscriptionPlan) => void;
  showComparison?: boolean;
}

export default function SubscriptionPlans({
  currentPlanId = 'free',
  onPlanSelect,
  showComparison = false,
}: SubscriptionPlansProps) {
  const { user } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      if (onPlanSelect) {
        await onPlanSelect(plan);
      } else {
        // Default behavior: redirect to checkout
        if (plan.price > 0) {
          window.location.href = `/checkout?priceId=${plan.priceId}`;
        } else {
          // For free plan, just update subscription
          const response = await fetch('/api/subscriptions/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              priceId: plan.priceId,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update subscription');
          }

          window.location.href = '/dashboard?subscription=updated';
        }
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Failed to select plan. Please try again.');
    } finally {
      setLoadingPlanId(null);
    }
  };

  const renderPlan = (plan: SubscriptionPlan, isPopular: boolean = false) => {
    const isCurrentPlan = plan.id === currentPlanId;
    const isLoading = loadingPlanId === plan.id;

    return (
      <div
        key={plan.id}
        className={`relative rounded-2xl p-8 ${
          isPopular
            ? 'bg-gradient-to-b from-blue-50 to-white border-2 border-blue-500 shadow-xl'
            : 'bg-white border-2 border-gray-200 shadow-lg'
        }`}
      >
        {isPopular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
              <StarIcon className="w-4 h-4 mr-1" />
              Most Popular
            </span>
          </div>
        )}

        {isCurrentPlan && (
          <div className="absolute top-4 right-4">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            <span className="text-xs text-green-600 font-medium">Current Plan</span>
          </div>
        )}

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <p className="text-gray-600 text-sm">{plan.description}</p>
        </div>

        <div className="text-center mb-6">
          <span className="text-4xl font-bold text-gray-900">
            ${plan.price}
          </span>
          <span className="text-gray-600 ml-1">
            /{plan.interval}
          </span>
        </div>

        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => handlePlanSelect(plan)}
          disabled={isCurrentPlan || isLoading}
          variant={isPopular ? 'primary' : isCurrentPlan ? 'secondary' : 'outline'}
          className="w-full py-3 text-lg font-semibold"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </span>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : plan.price > 0 ? (
            'Upgrade Now'
          ) : (
            'Get Started'
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {!showComparison && (
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your NDA management needs. Upgrade or downgrade at any time.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {renderPlan(SUBSCRIPTION_PLANS[0])} {/* Free Plan */}
        {renderPlan(SUBSCRIPTION_PLANS[1], true)} {/* Pro Plan */}
      </div>

      {showComparison && (
        <div className="mt-16 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Features
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">
                  Free
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900 bg-blue-50">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">NDA Storage</td>
                <td className="px-6 py-4 text-sm text-center text-gray-600">Up to 10</td>
                <td className="px-6 py-4 text-sm text-center text-gray-900 font-medium bg-blue-50">Unlimited</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Expiration Alerts</td>
                <td className="px-6 py-4 text-sm text-center text-gray-600">Manual only</td>
                <td className="px-6 py-4 text-sm text-center text-gray-900 font-medium bg-blue-50">
                  <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Support</td>
                <td className="px-6 py-4 text-sm text-center text-gray-600">Email</td>
                <td className="px-6 py-4 text-sm text-center text-gray-900 font-medium bg-blue-50">Priority</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Analytics</td>
                <td className="px-6 py-4 text-sm text-center text-gray-600">Basic</td>
                <td className="px-6 py-4 text-sm text-center text-gray-900 font-medium bg-blue-50">Advanced</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">API Access</td>
                <td className="px-6 py-4 text-sm text-center text-gray-600">—</td>
                <td className="px-6 py-4 text-sm text-center text-gray-900 font-medium bg-blue-50">
                  <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}