'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PaymentForm from '@/components/payment/PaymentForm';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/subscription';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function CheckoutContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const priceId = searchParams.get('priceId');

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout' + (priceId ? `?priceId=${priceId}` : ''));
      return;
    }

    if (!priceId) {
      setError('No price ID provided');
      setLoading(false);
      return;
    }

    const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.priceId === priceId);
    if (!selectedPlan) {
      setError('Invalid plan selected');
      setLoading(false);
      return;
    }

    setPlan(selectedPlan);
    setLoading(false);
  }, [user, priceId, router]);

  const handlePaymentSuccess = (subscriptionId: string) => {
    router.push(`/dashboard?subscription=success&id=${subscriptionId}`);
  };

  const handlePaymentCancel = () => {
    router.push('/pricing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Plan not found'}</p>
          <Button onClick={() => router.push('/pricing')}>
            Back to Pricing
          </Button>
        </div>
      </div>
    );
  }

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
            Complete Your Purchase
          </h1>
          <p className="text-gray-600">
            Secure checkout for the {plan.name} plan
          </p>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <PaymentForm
            plan={plan}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure Payment
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              30-Day Money Back
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              24/7 Support
            </div>
          </div>
          <p>
            Your payment information is encrypted and never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}