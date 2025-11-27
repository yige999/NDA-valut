import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCreemClient } from '@/lib/creem';
import crypto from 'crypto';

// Creem webhook event types
interface CreemWebhookEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      customer_id?: string;
      subscription_id?: string;
      payment_intent_id?: string;
      status?: string;
      current_period_start?: number;
      current_period_end?: number;
      metadata?: Record<string, any>;
      amount?: number;
      currency?: string;
    };
  };
  created: number;
  livemode: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('creem-signature');

    if (!signature) {
      console.error('Webhook error: Missing signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const creem = getCreemClient();
    const isValid = creem.verifyWebhookSignature(body, signature);

    if (!isValid) {
      console.error('Webhook error: Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event: CreemWebhookEvent = JSON.parse(body);
    console.log('Processing Creem webhook:', event.type, event.id);

    const supabase = createClient();

    // Handle different webhook event types
    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event, supabase);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(event, supabase);
        break;

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event, supabase);
        break;

      case 'subscription.payment_succeeded':
        await handlePaymentSucceeded(event, supabase);
        break;

      case 'subscription.payment_failed':
        await handlePaymentFailed(event, supabase);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event, supabase);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event, supabase);
        break;

      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(event: CreemWebhookEvent, supabase: any) {
  const subscription = event.data.object;
  const userId = subscription.metadata?.supabase_user_id;

  if (!userId) {
    console.error('No user ID found in subscription metadata');
    return;
  }

  // Determine plan type based on subscription price or product
  const planType = subscription.amount && subscription.amount > 0 ? 'pro' : 'free';

  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      creem_subscription_id: subscription.id,
      plan_type: planType,
      status: subscription.status || 'active',
      current_period_start: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : null,
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    });

  console.log('Subscription created for user:', userId);
}

async function handleSubscriptionUpdated(event: CreemWebhookEvent, supabase: any) {
  const subscription = event.data.object;

  await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : null,
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('creem_subscription_id', subscription.id);

  console.log('Subscription updated:', subscription.id);
}

async function handleSubscriptionCanceled(event: CreemWebhookEvent, supabase: any) {
  const subscription = event.data.object;

  await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('creem_subscription_id', subscription.id);

  console.log('Subscription canceled:', subscription.id);
}

async function handlePaymentSucceeded(event: CreemWebhookEvent, supabase: any) {
  const subscription = event.data.object;

  // Update subscription status to active if payment succeeded
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('creem_subscription_id', subscription.id);

  console.log('Payment succeeded for subscription:', subscription.id);
}

async function handlePaymentFailed(event: CreemWebhookEvent, supabase: any) {
  const subscription = event.data.object;

  await supabase
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('creem_subscription_id', subscription.id);

  console.log('Payment failed for subscription:', subscription.id);

  // TODO: Send notification to user about payment failure
}

async function handleInvoicePaymentSucceeded(event: CreemWebhookEvent, supabase: any) {
  const invoice = event.data.object;

  if (invoice.subscription_id) {
    // Update subscription status based on successful invoice payment
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('creem_subscription_id', invoice.subscription_id);

    console.log('Invoice payment succeeded for subscription:', invoice.subscription_id);
  }
}

async function handleInvoicePaymentFailed(event: CreemWebhookEvent, supabase: any) {
  const invoice = event.data.object;

  if (invoice.subscription_id) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('creem_subscription_id', invoice.subscription_id);

    console.log('Invoice payment failed for subscription:', invoice.subscription_id);

    // TODO: Send notification to user about invoice payment failure
  }
}