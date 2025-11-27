import { supabase } from './supabase';

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

// Fallback subscription function that doesn't require Creem
export async function getUserSubscriptionSafe(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Subscription check failed:', error);
    return null;
  }
}

// Create default Free subscription if none exists
export async function ensureDefaultSubscription(userId: string): Promise<UserSubscription> {
  // Check if subscription exists
  const existing = await getUserSubscriptionSafe(userId);

  if (existing) {
    return existing;
  }

  // Create default free subscription
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      creem_subscription_id: null,
      plan_type: 'free',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create default subscription:', error);
    // Return a default object to prevent crashes
    return {
      id: 'default',
      user_id: userId,
      creem_subscription_id: null,
      plan_type: 'free',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data;
}