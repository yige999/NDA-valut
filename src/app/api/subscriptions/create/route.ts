// 临时禁用Creem的API路由 - 仅返回模拟响应

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 临时响应 - 不实际创建订阅
    return NextResponse.json({
      subscriptionId: 'temp_sub_' + Date.now(),
      clientSecret: 'temp_client_secret',
      requiresAction: false,
      message: 'Creem payment is temporarily disabled. This is a mock response.'
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