import { getCreemClient, CreemSubscription } from './creem';
import { supabase } from './supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  priceId: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    currency: 'USD',
    interval: 'month',
    priceId: 'price_free_plan',
    features: [
      'Up to 10 NDAs',
      'Basic upload and storage',
      'Manual tracking',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals and teams',
    price: 49,
    currency: 'USD',
    interval: 'month',
    priceId: 'price_pro_plan_monthly',
    features: [
      'Unlimited NDAs',
      'Automatic expiration alerts',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access',
    ],
  },
];

export interface UserSubscription {
  id: string;
  user_id: string;
  creem_subscription_id: string | null;
  plan_type: 'free' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

// Get user's current subscription
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found error
    throw error;
  }

  return data;
}

// Create or update user subscription
export async function upsertUserSubscription(
  userId: string,
  creemSubscriptionId: string,
  planType: 'free' | 'pro',
  creemSubscription?: CreemSubscription
): Promise<UserSubscription> {
  const subscriptionData = {
    user_id: userId,
    creem_subscription_id: creemSubscriptionId,
    plan_type: planType,
    status: creemSubscription?.status || 'active',
    current_period_start: creemSubscription
      ? new Date(creemSubscription.current_period_start * 1000).toISOString()
      : null,
    current_period_end: creemSubscription
      ? new Date(creemSubscription.current_period_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'user_id'
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Create Creem subscription for user
export async function createSubscription(
  userId: string,
  priceId: string
): Promise<{ subscription: CreemSubscription; clientSecret: string }> {
  // First, ensure user has a Creem customer account
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error('User not authenticated');
  }

  let creemCustomerId = user.data.user.user_metadata?.creem_customer_id;

  // Create customer if doesn't exist
  if (!creemCustomerId) {
    const creem = getCreemClient();
    const customer = await creem.createCustomer({
      email: user.data.user.email!,
      name: user.data.user.user_metadata?.full_name || user.data.user.email!,
      metadata: {
        supabase_user_id: userId,
      },
    });

    creemCustomerId = customer.id;

    // Store customer ID in user metadata
    await supabase.auth.updateUser({
      data: { creem_customer_id: creemCustomerId }
    });
  }

  // Create subscription
  const creem = getCreemClient();
  const subscription = await creem.createSubscription(
    creemCustomerId,
    priceId,
    {
      supabase_user_id: userId,
    }
  );

  // Determine plan type based on price
  const plan = SUBSCRIPTION_PLANS.find(p => p.priceId === priceId);
  if (!plan) {
    throw new Error('Invalid price ID');
  }

  // Store subscription in database
  await upsertUserSubscription(userId, subscription.id, plan.id as 'free' | 'pro', subscription);

  return {
    subscription,
    clientSecret: subscription.id, // Adjust based on actual Creem API response
  };
}

// Cancel user subscription
export async function cancelSubscription(userId: string): Promise<void> {
  const userSubscription = await getUserSubscription(userId);

  if (!userSubscription || !userSubscription.creem_subscription_id) {
    throw new Error('No active subscription found');
  }

  const creem = getCreemClient();
  await creem.cancelSubscription(userSubscription.creem_subscription_id);

  // Update local database
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

// Check if user has access to a feature
export async function checkFeatureAccess(
  userId: string,
  feature: keyof typeof SUBSCRIPTION_FEATURES
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return SUBSCRIPTION_FEATURES[feature].free;
  }

  if (subscription.plan_type === 'pro' && subscription.status === 'active') {
    return true;
  }

  return SUBSCRIPTION_FEATURES[feature].free;
}

// Feature access matrix
const SUBSCRIPTION_FEATURES = {
  max_ndas: { free: true, pro: true },
  automatic_alerts: { free: false, pro: true },
  priority_support: { free: false, pro: true },
  advanced_analytics: { free: false, pro: true },
  custom_branding: { free: false, pro: true },
  api_access: { free: false, pro: true },
} as const;

// Get user's NDA limit
export async function getNDALimit(userId: string): Promise<number> {
  const subscription = await getUserSubscription(userId);

  if (!subscription || subscription.plan_type === 'free') {
    return 10; // Free plan limit
  }

  return Infinity; // Pro plan has unlimited NDAs
}

// Check if user can upload more NDAs
export async function canUploadMoreNDAs(userId: string): Promise<boolean> {
  const limit = await getNDALimit(userId);

  if (limit === Infinity) {
    return true;
  }

  const { count, error } = await supabase
    .from('agreements')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return (count || 0) < limit;
}

// Get current active subscription with synced status from Creem
export async function getSyncedUserSubscription(userId: string): Promise<UserSubscription | null> {
  const localSubscription = await getUserSubscription(userId);

  if (!localSubscription || !localSubscription.creem_subscription_id) {
    return localSubscription;
  }

  try {
    const creem = getCreemClient();
    const creemSubscription = await creem.retrieveSubscription(localSubscription.creem_subscription_id);

    // Update local database with latest status
    await upsertUserSubscription(
      userId,
      localSubscription.creem_subscription_id,
      localSubscription.plan_type,
      creemSubscription
    );

    // Return updated subscription
    return await getUserSubscription(userId);
  } catch (error) {
    console.error('Failed to sync subscription from Creem:', error);
    return localSubscription;
  }
}