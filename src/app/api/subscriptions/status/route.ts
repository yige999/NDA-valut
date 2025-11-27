// 临时禁用Creem的订阅状态API

import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscription } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    // 使用临时版本的getUserSubscription
    const subscription = await getUserSubscription('temp_user_id');

    return NextResponse.json({
      subscription,
      user: {
        id: 'temp_user_id',
        email: 'user@example.com',
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