import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSubscription } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { priceId, paymentMethodId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Create subscription using our subscription utility
    const result = await createSubscription(user.id, priceId);

    return NextResponse.json({
      subscriptionId: result.subscription.id,
      clientSecret: result.clientSecret,
      requiresAction: false, // Adjust based on Creem's actual response
    });

  } catch (error) {
    console.error('Subscription creation error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create subscription',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}