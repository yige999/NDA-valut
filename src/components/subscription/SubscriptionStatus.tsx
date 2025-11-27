'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserSubscription, getSyncedUserSubscription, cancelSubscription } from '@/lib/subscription';
import { getUserSubscriptionSafe } from '@/lib/subscription-fallback';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface SubscriptionStatusProps {
  showActions?: boolean;
  compact?: boolean;
}

export default function SubscriptionStatus({ showActions = true, compact = false }: SubscriptionStatusProps) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try synced subscription (with Creem)
        const sub = await getSyncedUserSubscription(user.id);
        setSubscription(sub);
      } catch (err) {
        console.error('Failed to load synced subscription:', err);

        // Fallback to safe subscription (without Creem)
        try {
          const fallbackSub = await getUserSubscriptionSafe(user.id);
          setSubscription(fallbackSub);
        } catch (fallbackErr) {
          console.error('Failed to load fallback subscription:', fallbackErr);
          // Default to free plan to prevent complete failure
          setSubscription({
            id: 'default',
            user_id: user.id,
            creem_subscription_id: null,
            plan_type: 'free',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user]);

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;

    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }

    try {
      setCancelling(true);
      setError(null);
      await cancelSubscription(user.id);

      // Reload subscription data
      const updatedSub = await getSyncedUserSubscription(user.id);
      setSubscription(updatedSub);
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = () => {
    if (!subscription || subscription.plan_type === 'free') {
      return <CreditCardIcon className="w-5 h-5 text-gray-400" />;
    }

    switch (subscription.status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'canceled':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'past_due':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <CreditCardIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!subscription) {
      return 'Free Plan';
    }

    if (subscription.plan_type === 'free') {
      return 'Free Plan';
    }

    const planName = subscription.plan_type === 'pro' ? 'Pro' : 'Free';
    const statusText = subscription.status === 'active' ? '' : ` (${subscription.status.replace('_', ' ')})`;

    return `${planName} Plan${statusText}`;
  };

  const getStatusColor = () => {
    if (!subscription || subscription.plan_type === 'free') {
      return 'text-gray-600';
    }

    switch (subscription.status) {
      case 'active':
        return 'text-green-600';
      case 'canceled':
        return 'text-yellow-600';
      case 'past_due':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getNextBillingDate = () => {
    if (!subscription || !subscription.current_period_end) {
      return null;
    }

    const endDate = new Date(subscription.current_period_end);
    return endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-48"></div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={`font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Subscription Status</h3>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-lg font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      {subscription && subscription.plan_type === 'pro' && (
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Plan Type</span>
            <span className="font-medium">Pro</span>
          </div>

          {subscription.current_period_end && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {subscription.status === 'canceled' ? 'Access until' : 'Next billing date'}
              </span>
              <span className="font-medium">{getNextBillingDate()}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price</span>
            <span className="font-medium">$49/month</span>
          </div>

          {subscription.status === 'canceled' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Your subscription has been canceled. You will continue to have access to Pro features until {getNextBillingDate()}.
              </p>
            </div>
          )}

          {subscription.status === 'past_due' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                Your subscription payment is past due. Please update your payment method to continue using Pro features.
              </p>
            </div>
          )}
        </div>
      )}

      {!subscription || subscription.plan_type === 'free' ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Upgrade to Pro</h4>
          <p className="text-sm text-blue-800 mb-3">
            Get unlimited NDAs, automatic expiration alerts, priority support, and more.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = '/pricing'}
          >
            Upgrade Now
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Pro Benefits</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Unlimited NDA storage</li>
              <li>✓ Automatic expiration alerts</li>
              <li>✓ Priority customer support</li>
              <li>✓ Advanced analytics</li>
              <li>✓ API access</li>
            </ul>
          </div>

          {showActions && subscription.status === 'active' && (
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/billing'}
              >
                Update Payment Method
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSubscription}
                disabled={cancelling}
              >
                {cancelling ? 'Canceling...' : 'Cancel Subscription'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}