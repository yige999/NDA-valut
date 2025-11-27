// Creem Payment Integration
// Note: This is a template implementation. You'll need to update it based on the actual Creem API documentation.

interface CreemConfig {
  apiKey: string;
  apiSecret: string;
  environment: 'sandbox' | 'production';
  webhookSecret?: string;
}

interface CreemCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, any>;
}

interface CreemSubscription {
  id: string;
  customer_id: string;
  price_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_start: number;
  current_period_end: number;
  created_at: number;
  metadata?: Record<string, any>;
}

interface CreemPrice {
  id: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  product_id: string;
  metadata?: Record<string, any>;
}

interface CreemProduct {
  id: string;
  name: string;
  description?: string;
  prices: CreemPrice[];
}

interface CreemPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  customer_id?: string;
  status: string;
  payment_method_id?: string;
  client_secret?: string;
}

class CreemClient {
  private config: CreemConfig;
  private baseUrl: string;

  constructor(config: CreemConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.creem.io'
      : 'https://api.sandbox.creem.io';
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Creem API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Customer management
  async createCustomer(customer: Omit<CreemCustomer, 'id'>): Promise<CreemCustomer> {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async retrieveCustomer(customerId: string): Promise<CreemCustomer> {
    return this.request(`/customers/${customerId}`);
  }

  async updateCustomer(customerId: string, updates: Partial<CreemCustomer>): Promise<CreemCustomer> {
    return this.request(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Subscription management
  async createSubscription(customerId: string, priceId: string, metadata?: Record<string, any>): Promise<CreemSubscription> {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: customerId,
        price_id: priceId,
        metadata,
      }),
    });
  }

  async retrieveSubscription(subscriptionId: string): Promise<CreemSubscription> {
    return this.request(`/subscriptions/${subscriptionId}`);
  }

  async cancelSubscription(subscriptionId: string): Promise<CreemSubscription> {
    return this.request(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    });
  }

  async updateSubscription(subscriptionId: string, priceId: string): Promise<CreemSubscription> {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      body: JSON.stringify({ price_id: priceId }),
    });
  }

  // Product and pricing
  async retrievePrice(priceId: string): Promise<CreemPrice> {
    return this.request(`/prices/${priceId}`);
  }

  async listPrices(productId?: string): Promise<CreemPrice[]> {
    const params = productId ? `?product_id=${productId}` : '';
    return this.request(`/prices${params}`);
  }

  // Payment processing
  async createPaymentIntent(amount: number, currency: string = 'usd', customerId?: string): Promise<CreemPaymentIntent> {
    return this.request('/payment_intents', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        currency,
        customer_id: customerId,
      }),
    });
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<CreemPaymentIntent> {
    return this.request(`/payment_intents/${paymentIntentId}`);
  }

  // Webhook signature verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Note: Implement signature verification based on Creem's webhook documentation
    // This is a placeholder implementation
    const crypto = require('crypto');

    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret || '')
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }
}

// Singleton instance
let creemClient: CreemClient | null = null;

export function getCreemClient(): CreemClient {
  if (!creemClient) {
    const config: CreemConfig = {
      apiKey: process.env.CREEM_API_KEY || '',
      apiSecret: process.env.CREEM_API_SECRET || '',
      environment: (process.env.CREEM_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      webhookSecret: process.env.CREEM_WEBHOOK_SECRET,
    };

    if (!config.apiKey) {
      throw new Error('CREEM_API_KEY environment variable is required');
    }

    creemClient = new CreemClient(config);
  }

  return creemClient;
}

// Export types and client
export { CreemClient };
export type { CreemConfig, CreemCustomer, CreemSubscription, CreemPrice, CreemProduct, CreemPaymentIntent };