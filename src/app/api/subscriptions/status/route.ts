import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSyncedUserSubscription } from '@/lib/subscription';

export async function GET(request: NextRequest) {
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

    // Get user's subscription status (synced with Creem)
    const subscription = await getSyncedUserSubscription(user.id);

    return NextResponse.json({
      subscription,
      user: {
        id: user.id,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('Subscription status error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get subscription status',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}