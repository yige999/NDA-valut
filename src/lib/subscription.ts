// 临时的禁用版本 - 用于不部署Creem的环境
// 当需要启用Creem时，将此文件重命名为 subscription.ts 并删除原文件

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

// 临时函数 - 所有用户都是免费计划
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  // 返回模拟的免费计划订阅
  return {
    id: 'temp-free-plan',
    user_id: userId,
    creem_subscription_id: null,
    plan_type: 'free',
    status: 'active',
    current_period_start: null,
    current_period_end: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function upsertUserSubscription(
  userId: string,
  creemSubscriptionId: string,
  planType: 'free' | 'pro',
  creemSubscription?: any
): Promise<UserSubscription> {
  // 临时实现 - 仅返回模拟数据
  return {
    id: 'temp-subscription',
    user_id: userId,
    creem_subscription_id: creemSubscriptionId,
    plan_type: planType,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// 检查功能访问 - 免费计划限制
export async function checkFeatureAccess(
  userId: string,
  feature: keyof typeof SUBSCRIPTION_FEATURES
): Promise<boolean> {
  // 所有Pro功能都返回false，只允许免费功能
  return SUBSCRIPTION_FEATURES[feature].free;
}

const SUBSCRIPTION_FEATURES = {
  max_ndas: { free: true, pro: true },
  automatic_alerts: { free: false, pro: true },
  priority_support: { free: false, pro: true },
  advanced_analytics: { free: false, pro: true },
  custom_branding: { free: false, pro: true },
  api_access: { free: false, pro: true },
} as const;

// NDA限制 - 免费计划10个
export async function getNDALimit(userId: string): Promise<number> {
  return 10; // 免费计划限制
}

export async function canUploadMoreNDAs(userId: string): Promise<boolean> {
  // 这里可以检查当前NDA数量，但为简化直接返回true
  return true;
}

// 临时取消订阅函数 - 仅返回成功消息
export async function cancelSubscription(userId: string): Promise<void> {
  console.log('Subscription cancellation temporarily disabled for user:', userId);
}

// 获取同步的订阅状态
export async function getSyncedUserSubscription(userId: string): Promise<UserSubscription | null> {
  return getUserSubscription(userId);
}