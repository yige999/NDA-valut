'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionPlans from '@/components/pricing/SubscriptionPlans';
import PaymentForm from '@/components/payment/PaymentForm';
import { SUBSCRIPTION_PLANS, SubscriptionPlan, getUserSubscription } from '@/lib/subscription';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function PricingContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const priceId = searchParams.get('priceId');
  const checkout = searchParams.get('checkout') === 'true';

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadSubscription = async () => {
      try {
        const subscription = await getUserSubscription(user.id);
        setCurrentSubscription(subscription);

        // If priceId is provided, set the selected plan
        if (priceId) {
          const plan = SUBSCRIPTION_PLANS.find(p => p.priceId === priceId);
          if (plan) {
            setSelectedPlan(plan);
          }
        }
      } catch (error) {
        console.error('Failed to load subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user, priceId]);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (plan.price === 0) {
      // For free plan, handle directly
      window.location.href = `/dashboard?subscription=free`;
    } else {
      // For paid plans, go to checkout
      setSelectedPlan(plan);
      window.history.pushState(
        {},
        '',
        `/pricing?priceId=${plan.priceId}&checkout=true`
      );
    }
  };

  const handlePaymentSuccess = (subscriptionId: string) => {
    // Redirect to dashboard with success message
    window.location.href = `/dashboard?subscription=success&id=${subscriptionId}`;
  };

  const handlePaymentCancel = () => {
    setSelectedPlan(null);
    window.history.pushState({}, '', '/pricing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show payment form if a plan is selected
  if (selectedPlan && checkout) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              variant="outline"
              onClick={handlePaymentCancel}
              className="mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Subscription
            </h1>
            <p className="text-gray-600">
              You're upgrading to the {selectedPlan.name} plan
            </p>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <PaymentForm
              plan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pricing Plans</h1>
              <p className="text-gray-600 mt-1">
                Choose the perfect plan for your NDA management needs
              </p>
            </div>
            {user && (
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
              >
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {user && currentSubscription && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Current Subscription</h3>
                <p className="text-sm text-blue-800 mt-1">
                  You are currently on the {currentSubscription.plan_type} plan.
                  {currentSubscription.status !== 'active' && (
                    <span className="ml-1">Status: {currentSubscription.status}</span>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
              >
                Manage Subscription
              </Button>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <SubscriptionPlans
          currentPlanId={currentSubscription?.plan_type}
          onPlanSelect={handlePlanSelect}
          showComparison={true}
        />

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will take effect immediately for upgrades, and at the next billing period for downgrades.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I cancel my subscription?
              </h3>
              <p className="text-gray-600">
                You'll continue to have access to Pro features until the end of your current billing period. After that, your account will revert to the Free plan with its limitations.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Yes, we use industry-standard encryption and security measures to protect your NDA documents and personal information. All data is encrypted at rest and in transit.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for new Pro subscriptions. If you're not satisfied, contact our support team within 30 days of your purchase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}