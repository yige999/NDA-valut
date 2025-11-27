import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Resend would need to be installed: npm install resend
// For now, we'll create a placeholder that logs what would be sent

export async function POST() {
  try {
    console.log('Starting manual email alert job...')

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Calculate the date 30 days from now
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    const targetDate = thirtyDaysFromNow.toISOString().split('T')[0]

    console.log(`Looking for agreements expiring on: ${targetDate}`)

    // Query for agreements that need alerts
    const { data: agreements, error: fetchError } = await supabase
      .from('agreements')
      .select('*')
      .eq('alert_enabled', true)
      .eq('expiration_date', targetDate)
      .eq('status', 'active')

    if (fetchError) {
      console.error('Error fetching agreements:', fetchError)
      throw fetchError
    }

    console.log(`Found ${agreements?.length || 0} agreements requiring alerts`)

    if (!agreements || agreements.length === 0) {
      return NextResponse.json({
        message: 'No agreements require alerts today',
        agreementsFound: 0
      })
    }

    // Group agreements by user
    const userAgreements = agreements.reduce((acc, agreement) => {
      const userEmail = agreement.user_id // Use user_id as identifier for now

      if (!acc[userEmail]) {
        acc[userEmail] = []
      }
      acc[userEmail].push(agreement)
      return acc
    }, {} as Record<string, any[]>)

    // For the manual version, we'll log what would be sent
    const emailLog = Object.entries(userAgreements).map(([userEmail, userAgreementList]) => {
      const agreementList = (userAgreementList as any[]).map(nda =>
        `• ${nda.counterparty_name} - expires on ${new Date(nda.expiration_date).toLocaleDateString()}`
      ).join('\n')

      return {
        to: userEmail,
        subject: `⚠️ ${(userAgreementList as any[]).length} NDA${(userAgreementList as any[]).length > 1 ? 's' : ''} expires in 30 days`,
        body: `
Hi,

Your NDAVault dashboard shows that you have ${(userAgreementList as any[]).length} agreement(s) expiring in 30 days:

${agreementList}

→ View Details: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://ndavault.vercel.app'}/dashboard

Need help? Reply to this email.

Best,
NDAVault Team
        `.trim(),
        agreementsCount: (userAgreementList as any[]).length
      }
    })

    const summary = {
      agreementsFound: agreements.length,
      uniqueUsers: Object.keys(userAgreements).length,
      emailsThatWouldBeSent: emailLog.length,
      emailPreviews: emailLog,
      timestamp: new Date().toISOString(),
      note: 'This is a manual trigger. In production, emails would be sent via Resend.'
    }

    console.log('Manual email alert job completed:', summary)

    return NextResponse.json(summary)

  } catch (error: any) {
    console.error('Manual email alert job failed:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Simple endpoint to check the status
  return NextResponse.json({
    status: 'Email alert API is running',
    timestamp: new Date().toISOString(),
    usage: 'POST /api/send-alerts to trigger manual email sending'
  })
}