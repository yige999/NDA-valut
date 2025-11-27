// Creem Payment Client - Based on common payment platform patterns
// This implementation should be adapted based on the actual Creem API documentation

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
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  current_period_start: number;
  current_period_end: number;
  created_at: number;
  trial_end?: number;
  metadata?: Record<string, any>;
}

interface CreemPrice {
  id: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year' | 'week' | 'day';
  interval_count?: number;
  product_id: string;
  metadata?: Record<string, any>;
}

interface CreemProduct {
  id: string;
  name: string;
  description?: string;
  prices: CreemPrice[];
  metadata?: Record<string, any>;
}

interface CreemPaymentMethod {
  id: string;
  type: string;
  customer_id: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  metadata?: Record<string, any>;
}

interface CreemInvoice {
  id: string;
  customer_id: string;
  subscription_id?: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  due_date?: number;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  metadata?: Record<string, any>;
}

// Generic API response wrapper
interface CreemApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    type?: string;
    code?: string;
  };
  pagination?: {
    has_more: boolean;
    total_count?: number;
  };
}

class CreemClient {
  private config: CreemConfig;
  private baseUrl: string;

  constructor(config: CreemConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.creem.io/v1'  // Typical production URL pattern
      : 'https://api.sandbox.creem.io/v1';  // Typical sandbox URL pattern
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CreemApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: {
            message: data.error?.message || `HTTP ${response.status}: ${response.statusText}`,
            type: data.error?.type,
            code: data.error?.code,
          }
        };
      }

      return { data: data.data || data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error occurred',
          type: 'network_error',
        }
      };
    }
  }

  // Customer Management
  async createCustomer(customer: Omit<CreemCustomer, 'id'>): Promise<CreemApiResponse<CreemCustomer>> {
    return this.request<CreemCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async retrieveCustomer(customerId: string): Promise<CreemApiResponse<CreemCustomer>> {
    return this.request<CreemCustomer>(`/customers/${customerId}`);
  }

  async updateCustomer(
    customerId: string,
    updates: Partial<CreemCustomer>
  ): Promise<CreemApiResponse<CreemCustomer>> {
    return this.request<CreemCustomer>(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCustomer(customerId: string): Promise<CreemApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/customers/${customerId}`, {
      method: 'DELETE',
    });
  }

  // Subscription Management
  async createSubscription(
    customerId: string,
    priceId: string,
    options: {
      trial_period_days?: number;
      metadata?: Record<string, any>;
      payment_method_id?: string;
      coupon_id?: string;
    } = {}
  ): Promise<CreemApiResponse<CreemSubscription>> {
    return this.request<CreemSubscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: customerId,
        price_id: priceId,
        ...options,
      }),
    });
  }

  async retrieveSubscription(subscriptionId: string): Promise<CreemApiResponse<CreemSubscription>> {
    return this.request<CreemSubscription>(`/subscriptions/${subscriptionId}`);
  }

  async updateSubscription(
    subscriptionId: string,
    updates: {
      price_id?: string;
      metadata?: Record<string, any>;
      proration_behavior?: 'create_prorations' | 'none';
    }
  ): Promise<CreemApiResponse<CreemSubscription>> {
    return this.request<CreemSubscription>(`/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async cancelSubscription(
    subscriptionId: string,
    options: {
      at_period_end?: boolean;
      reason?: string;
    } = {}
  ): Promise<CreemApiResponse<CreemSubscription>> {
    return this.request<CreemSubscription>(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async pauseSubscription(
    subscriptionId: string,
    options: {
      behavior?: 'mark_uncollectible' | 'keep_as_draft' | 'void';
    } = {}
  ): Promise<CreemApiResponse<CreemSubscription>> {
    return this.request<CreemSubscription>(`/subscriptions/${subscriptionId}/pause`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async resumeSubscription(subscriptionId: string): Promise<CreemApiResponse<CreemSubscription>> {
    return this.request<CreemSubscription>(`/subscriptions/${subscriptionId}/resume`, {
      method: 'POST',
    });
  }

  // Product and Price Management
  async retrievePrice(priceId: string): Promise<CreemApiResponse<CreemPrice>> {
    return this.request<CreemPrice>(`/prices/${priceId}`);
  }

  async listPrices(options: {
    product?: string;
    active?: boolean;
    limit?: number;
    starting_after?: string;
  } = {}): Promise<CreemApiResponse<CreemPrice[]>> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    return this.request<CreemPrice[]>(`/prices?${params.toString()}`);
  }

  async retrieveProduct(productId: string): Promise<CreemApiResponse<CreemProduct>> {
    return this.request<CreemProduct>(`/products/${productId}`);
  }

  async listProducts(options: {
    active?: boolean;
    limit?: number;
    starting_after?: string;
  } = {}): Promise<CreemApiResponse<CreemProduct[]>> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    return this.request<CreemProduct[]>(`/products?${params.toString()}`);
  }

  // Payment Method Management
  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<CreemApiResponse<CreemPaymentMethod>> {
    return this.request<CreemPaymentMethod>(`/customers/${customerId}/payment_methods`, {
      method: 'POST',
      body: JSON.stringify({ payment_method_id: paymentMethodId }),
    });
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<CreemApiResponse<CreemPaymentMethod>> {
    return this.request<CreemPaymentMethod>(`/payment_methods/${paymentMethodId}/detach`, {
      method: 'POST',
    });
  }

  async listPaymentMethods(customerId: string): Promise<CreemApiResponse<CreemPaymentMethod[]>> {
    return this.request<CreemPaymentMethod[]>(`/customers/${customerId}/payment_methods`);
  }

  // Invoice Management
  async retrieveInvoice(invoiceId: string): Promise<CreemApiResponse<CreemInvoice>> {
    return this.request<CreemInvoice>(`/invoices/${invoiceId}`);
  }

  async listInvoices(customerId: string): Promise<CreemApiResponse<CreemInvoice[]>> {
    return this.request<CreemInvoice[]>(`/invoices?customer=${customerId}`);
  }

  // Webhook signature verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      console.warn('Webhook secret not configured - skipping signature verification');
      return true;
    }

    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');

      // Compare signatures safely
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.request('/accounts');
      return !response.error;
    } catch {
      return false;
    }
  }

  getConfig(): Omit<CreemConfig, 'apiSecret' | 'webhookSecret'> {
    return {
      apiKey: this.config.apiKey,
      environment: this.config.environment,
    };
  }
}

// Singleton pattern for easy access across the application
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

    if (!config.apiSecret) {
      throw new Error('CREEM_API_SECRET environment variable is required');
    }

    creemClient = new CreemClient(config);
  }

  return creemClient;
}

export function resetCreemClient(): void {
  creemClient = null;
}

// Export types for use throughout the application
export type {
  CreemConfig,
  CreemCustomer,
  CreemSubscription,
  CreemPrice,
  CreemProduct,
  CreemPaymentMethod,
  CreemInvoice,
  CreemApiResponse,
};

export { CreemClient };