'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SubscriptionPlan } from '@/lib/subscription';

interface PaymentFormProps {
  plan: SubscriptionPlan;
  onSuccess?: (subscriptionId: string) => void;
  onCancel?: () => void;
}

export default function PaymentForm({ plan, onSuccess, onCancel }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (plan.price > 0) {
        alert('Payment processing temporarily disabled. Contact support to upgrade.');
      } else {
        onSuccess?.('temp_free_subscription');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div className="flex justify-between">
          <span className="text-gray-600">{plan.name} Plan</span>
          <span className="font-medium">${plan.price}/{plan.interval}</span>
        </div>
      </div>

      {plan.price > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="font-medium text-yellow-800">Payment Processing Temporarily Disabled</p>
          <p className="text-sm text-yellow-700">Contact support to upgrade to Pro plan.</p>
        </div>
      )}

      <div className="flex space-x-4">
        <Button
          type="submit"
          variant={plan.price > 0 ? "outline" : "primary"}
          disabled={loading || plan.price > 0}
          className="flex-1"
        >
          {loading ? 'Processing...' :
           plan.price > 0 ? 'Contact Support to Upgrade' : 'Get Started Free'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}