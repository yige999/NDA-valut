'use client';

import { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { SubscriptionPlan } from '@/lib/subscription';

// Note: You'll need to replace this with your actual Stripe publishable key
// and potentially adapt this component based on Creem's actual payment implementation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  plan: SubscriptionPlan;
  onSuccess?: (subscriptionId: string) => void;
  onCancel?: () => void;
}

interface PaymentFormContentProps extends PaymentFormProps {
  stripe: Stripe | null;
  elements: any;
}

function PaymentFormContent({
  plan,
  onSuccess,
  onCancel,
  stripe,
  elements,
}: PaymentFormContentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment method using Stripe elements
      const cardElement = elements.getElement(CardElement);
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement!,
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Create subscription via our API
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          paymentMethodId: paymentMethod.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Handle 3D Secure if required
      if (data.requiresAction) {
        const { error: confirmError } = await stripe.confirmCardPayment(
          data.clientSecret
        );

        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      setSucceeded(true);
      onSuccess?.(data.subscriptionId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          Your {plan.name} subscription is now active.
        </p>
        <Button onClick={() => window.location.href = '/dashboard'}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">{plan.name} Plan</span>
            <span className="font-medium">${plan.price}/{plan.interval}</span>
          </div>
          {plan.price > 0 && (
            <>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>${plan.price}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${plan.price}/{plan.interval}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Form */}
      {plan.price > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credit Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !stripe || (plan.price > 0 && !elements)}
          className="flex-1"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </span>
          ) : plan.price > 0 ? (
            `Pay $${plan.price}`
          ) : (
            'Start Free Trial'
          )}
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

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Your payment information is encrypted and secure.
        </p>
        <p className="mt-1">
          By completing this purchase you agree to our Terms of Service.
        </p>
      </div>
    </form>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  // Note: This uses Stripe Elements as an example.
  // You'll need to adapt this to Creem's actual payment form implementation.
  // Creem might provide their own payment form component or SDK.

  if (props.plan.price === 0) {
    // For free plans, don't load Stripe
    return (
      <PaymentFormContent
        {...props}
        stripe={null}
        elements={null}
      />
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContentWithElements {...props} />
    </Elements>
  );
}

function PaymentFormContentWithElements(props: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  return (
    <PaymentFormContent
      {...props}
      stripe={stripe}
      elements={elements}
    />
  );
}