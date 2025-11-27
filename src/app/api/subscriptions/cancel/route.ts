import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelSubscription } from '@/lib/subscription';

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

    // Cancel subscription using our subscription utility
    await cancelSubscription(user.id);

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully'
    });

  } catch (error) {
    console.error('Subscription cancellation error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}