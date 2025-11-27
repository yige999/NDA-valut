import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  // 创建Supabase客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res.headers.append('Set-Cookie', req.cookies.toString())
        },
      },
    }
  )

  // 刷新session如果过期
  await supabase.auth.getSession()

  // 安全头部
  const requestHeaders = new Headers(req.headers)
  const responseHeaders = new Headers(res.headers)

  // 添加安全头部
  responseHeaders.set('X-Frame-Options', 'DENY')
  responseHeaders.set('X-Content-Type-Options', 'nosniff')
  responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  responseHeaders.set('X-XSS-Protection', '1; mode=block')

  // 如果是生产环境，添加HSTS
  if (process.env.NODE_ENV === 'production') {
    responseHeaders.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // CSP设置
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.creem.io",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.stripe.com https://api.creem.io https://yhnudmekuviaaydoxztn.supabase.co",
    "frame-src https://js.stripe.com https://checkout.creem.io"
  ].join('; ')

  responseHeaders.set('Content-Security-Policy', csp)

  // CORS设置
  if (req.nextUrl.pathname.startsWith('/api/')) {
    responseHeaders.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production'
      ? 'https://your-domain.vercel.app'
      : 'http://localhost:3000'
    )
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}