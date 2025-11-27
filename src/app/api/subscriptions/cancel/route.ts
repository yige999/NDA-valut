// 临时禁用Creem的取消订阅API

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 临时响应 - 不实际取消订阅
    return NextResponse.json({
      success: true,
      message: 'Creem payment is temporarily disabled. Subscription cancellation is simulated.',
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