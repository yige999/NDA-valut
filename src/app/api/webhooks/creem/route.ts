// 临时禁用Creem的Webhook处理器

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    console.log('Creem webhook received (temporarily disabled):', body);

    // 临时响应 - 不实际处理webhook
    return NextResponse.json({
      received: true,
      message: 'Creem webhooks are temporarily disabled. Event logged for debugging.'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed (temporarily disabled)' },
      { status: 500 }
    );
  }
}