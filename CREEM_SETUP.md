# Creem Payment Integration Setup Guide

This guide explains how to set up Creem payment integration for NDAVault.

## Prerequisites

1. **Creem Account**: Sign up for a Creem account at [creem.io](https://creem.io)
2. **API Keys**: Get your Creem API keys from the dashboard
3. **Webhook Endpoint**: Set up a public webhook endpoint for receiving payment events

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Creem Configuration
CREEM_API_KEY=your_creem_api_key_here
CREEM_API_SECRET=your_creem_api_secret_here
CREEM_ENVIRONMENT=sandbox  # or 'production' for live
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret_here

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Getting Creem API Credentials

1. **Log in to your Creem Dashboard**
2. **Navigate to Settings → API Keys**
3. **Create a new API key** with the following permissions:
   - `subscriptions:create`
   - `subscriptions:read`
   - `subscriptions:update`
   - `customers:create`
   - `customers:read`
   - `customers:update`
   - `payment_intents:create`
   - `payment_intents:read`

4. **Copy the API Key and Secret** to your environment variables

## Setting up Products and Prices

1. **Navigate to Products → Create Product**
2. **Create two products:**

### Free Plan Product
- **Name**: Free Plan
- **Description**: Basic NDA management with up to 10 NDAs
- **Price**: $0/month
- **Price ID**: `price_free_plan`

### Pro Plan Product
- **Name**: Pro Plan
- **Description**: Unlimited NDAs with automatic alerts and priority support
- **Price**: $49/month
- **Price ID**: `price_pro_plan_monthly`

## Configuring Webhooks

1. **In your Creem Dashboard, navigate to Webhooks**
2. **Add a new webhook endpoint**:
   - **URL**: `https://yourdomain.com/api/webhooks/creem`
   - **Events to subscribe to**:
     - `subscription.created`
     - `subscription.updated`
     - `subscription.canceled`
     - `subscription.payment_succeeded`
     - `subscription.payment_failed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Copy the Webhook Secret** to your environment variables

## Database Schema

The following tables are already set up in your Supabase database:

### `user_subscriptions`
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  creem_subscription_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro')),
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing the Integration

### 1. Sandbox Testing
- Use the sandbox environment for testing
- Creem provides test card numbers for simulating different payment scenarios

### 2. Test Scenarios
1. **New subscription creation**
   - Sign up as a new user
   - Navigate to `/pricing`
   - Select Pro plan
   - Complete payment flow

2. **Subscription updates**
   - Upgrade from Free to Pro
   - Downgrade from Pro to Free

3. **Payment failures**
   - Use test card that triggers payment failure
   - Verify webhook handling

4. **Subscription cancellation**
   - Cancel active Pro subscription
   - Verify access is maintained until end of billing period

## Security Considerations

1. **API Key Security**: Never expose API keys in client-side code
2. **Webhook Verification**: Always verify webhook signatures
3. **Error Handling**: Implement proper error handling for API failures
4. **Rate Limiting**: Be aware of Creem's rate limits

## Monitoring and Logs

Monitor the following:

1. **Webhook Delivery**: Check webhook logs in Creem dashboard
2. **API Errors**: Monitor application logs for API failures
3. **Subscription Status**: Regularly sync subscription status with Creem

## Troubleshooting

### Common Issues

1. **Webhook Not Received**
   - Check webhook URL is accessible
   - Verify webhook secret in environment variables
   - Check webhook logs in Creem dashboard

2. **Payment Fails**
   - Verify API keys are correct
   - Check product/price IDs match
   - Ensure customer metadata includes `supabase_user_id`

3. **Subscription Not Updated**
   - Check webhook processing logs
   - Verify database connection
   - Check for database constraint violations

### Debug Mode

Enable debug mode by setting:
```bash
DEBUG=creem:*
```

## Deployment

### 1. Environment Variables
Set production environment variables in your hosting platform:
- `CREEM_ENVIRONMENT=production`
- Update API keys with production credentials
- Set production webhook URL

### 2. Webhook URL
Update your webhook endpoint to your production domain:
```
https://yourdomain.com/api/webhooks/creem
```

### 3. Product Configuration
Ensure your production products and prices are properly configured in Creem.

## Support

- **Creem Documentation**: [docs.creem.io](https://docs.creem.io)
- **Creem Support**: support@creem.io
- **Application Issues**: Check application logs and error messages

## Code Structure

### Key Files

1. **`src/lib/creem.ts`** - Creem client and API utilities
2. **`src/lib/subscription.ts`** - Subscription management logic
3. **`src/components/pricing/SubscriptionPlans.tsx`** - Pricing component
4. **`src/components/payment/PaymentForm.tsx`** - Payment form component
5. **`src/components/subscription/SubscriptionStatus.tsx`** - Subscription status display
6. **`src/components/guards/SubscriptionGuard.tsx`** - Feature access protection
7. **`src/app/api/subscriptions/`** - API routes for subscription management
8. **`src/app/api/webhooks/creem/route.ts`** - Webhook event handler

### API Endpoints

- `POST /api/subscriptions/create` - Create new subscription
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/status` - Get subscription status
- `POST /api/webhooks/creem` - Handle Creem webhooks

### Pages

- `/pricing` - Plan selection and pricing
- `/checkout` - Payment processing
- `/billing` - Subscription management and billing history

## Future Enhancements

1. **Usage Metering**: Track NDA usage for billing
2. **Invoicing**: Generate and send invoices automatically
3. **Tax Calculation**: Implement tax calculation based on location
4. **Multiple Currencies**: Support for international payments
5. **Subscription Pausing**: Allow users to pause subscriptions
6. **Usage Analytics**: Dashboard for subscription metrics