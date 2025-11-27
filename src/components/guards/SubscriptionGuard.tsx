'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkFeatureAccess, canUploadMoreNDAs } from '@/lib/subscription';
import { getUserSubscriptionSafe } from '@/lib/subscription-fallback';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  LockClosedIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface SubscriptionGuardProps {
  children: ReactNode;
  feature?: keyof typeof SUBSCRIPTION_FEATURES;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  upgradePromptTitle?: string;
  upgradePromptMessage?: string;
}

const SUBSCRIPTION_FEATURES = {
  automatic_alerts: { name: 'Automatic Alerts', description: 'Get notified before your NDAs expire' },
  priority_support: { name: 'Priority Support', description: 'Get help from our team faster' },
  advanced_analytics: { name: 'Advanced Analytics', description: 'Detailed insights into your NDAs' },
  custom_branding: { name: 'Custom Branding', description: 'Add your logo and colors' },
  api_access: { name: 'API Access', description: 'Integrate NDAVault with your tools' },
} as const;

interface UpgradePromptProps {
  title: string;
  message: string;
  feature?: string;
  onClose?: () => void;
}

function UpgradePrompt({ title, message, feature, onClose }: UpgradePromptProps) {
  const handleUpgrade = () => {
    window.location.href = `/pricing${feature ? `?feature=${feature}` : ''}`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">{title}</h3>
          <p className="text-blue-800 mb-4">{message}</p>
          <div className="flex space-x-3">
            <Button
              variant="primary"
              onClick={handleUpgrade}
            >
              Upgrade to Pro
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
              >
                Maybe Later
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionGuard({
  children,
  feature,
  fallback,
  showUpgradePrompt = true,
  upgradePromptTitle = 'Upgrade to Pro',
  upgradePromptMessage = 'Get unlimited NDAs, automatic expiration alerts, priority support, and more.',
}: SubscriptionGuardProps) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    const checkAccess = async () => {
      try {
        setLoading(true);

        if (feature) {
          // Check specific feature access with fallback
          try {
            const access = await checkFeatureAccess(user.id, feature);
            setHasAccess(access);
          } catch (error) {
            console.error('Error checking feature access:', error);
            // Fallback to checking subscription type directly
            const subscription = await getUserSubscriptionSafe(user.id);
            const hasProAccess = subscription?.plan_type === 'pro' && subscription.status === 'active';
            setHasAccess(hasProAccess);
          }
        } else {
          // Default to checking NDA upload limit with fallback
          try {
            const canUpload = await canUploadMoreNDAs(user.id);
            setHasAccess(canUpload);
          } catch (error) {
            console.error('Error checking upload limit:', error);
            // Fallback to checking subscription and current NDA count
            const subscription = await getUserSubscriptionSafe(user.id);
            const hasProAccess = subscription?.plan_type === 'pro' && subscription.status === 'active';
            setHasAccess(hasProAccess);
          }
        }
      } catch (error) {
        console.error('Error checking subscription access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, feature]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!user) {
    // User not authenticated
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <LockClosedIcon className="w-6 h-6 text-yellow-600" />
          <div>
            <h3 className="font-semibold text-yellow-900">Sign In Required</h3>
            <p className="text-yellow-800 mb-3">Please sign in to access this feature.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return (
      <Alert variant="warning">
        <div className="flex items-center space-x-3">
          <LockClosedIcon className="w-5 h-5" />
          <span>
            {feature && SUBSCRIPTION_FEATURES[feature]
              ? `${SUBSCRIPTION_FEATURES[feature].name} is a Pro feature`
              : 'This feature requires a Pro subscription'}
          </span>
        </div>
      </Alert>
    );
  }

  const featureInfo = feature ? SUBSCRIPTION_FEATURES[feature] : null;
  const title = featureInfo ? `${featureInfo.name} - Pro Feature` : upgradePromptTitle;
  const message = featureInfo
    ? `Unlock ${featureInfo.name.toLowerCase()}: ${featureInfo.description}`
    : upgradePromptMessage;

  return (
    <UpgradePrompt
      title={title}
      message={message}
      feature={feature}
      onClose={() => setShowPrompt(false)}
    />
  );
}

// Hook for checking subscription status in components
export function useSubscriptionGuard() {
  const { user } = useAuth();
  const [canUpload, setCanUpload] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCanUpload(false);
      setLoading(false);
      return;
    }

    const checkUploadAccess = async () => {
      try {
        setLoading(true);
        const uploadAccess = await canUploadMoreNDAs(user.id);
        setCanUpload(uploadAccess);
      } catch (error) {
        console.error('Error checking upload access:', error);
        setCanUpload(false);
      } finally {
        setLoading(false);
      }
    };

    checkUploadAccess();
  }, [user]);

  return { canUpload, loading };
}

// Higher-order component for protecting routes or components
export function withSubscriptionGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<SubscriptionGuardProps, 'children'> = {}
) {
  return function WrappedComponent(props: P) {
    return (
      <SubscriptionGuard {...options}>
        <Component {...props} />
      </SubscriptionGuard>
    );
  };
}