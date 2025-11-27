'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminAlertsPage() {
  const { user, loading } = useAuth()
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  // Simple admin check - in production, use proper role-based access
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('test')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Go to sign in page
          </a>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is for administrators only.</p>
          <a href="/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-500 font-medium">
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  const handleTestEmail = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/send-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      setTestResult(result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to test email system')
      }
    } catch (error: any) {
      setTestResult({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/dashboard" className="text-2xl font-bold text-blue-600">
                NDAVault Admin
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.email}
              </span>
              <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Email Alert System
            </h1>
            <p className="mt-2 text-gray-600">
              Test and monitor the NDA expiration email alert system
            </p>
          </div>

          <div className="space-y-6">
            {/* Test Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Manual Email Test
              </h2>
              <p className="text-gray-600 mb-4">
                Trigger a manual email alert check. This will simulate the daily alert job
                and show which emails would be sent.
              </p>

              <button
                onClick={handleTestEmail}
                disabled={testing}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? 'Testing...' : 'Run Email Alert Test'}
              </button>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Test Results
                </h3>

                {testResult.error ? (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    <strong>Error:</strong> {testResult.error}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-900">
                          {testResult.agreementsFound || 0}
                        </div>
                        <div className="text-sm text-blue-700">
                          Agreements Found
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-900">
                          {testResult.uniqueUsers || 0}
                        </div>
                        <div className="text-sm text-green-700">
                          Unique Users
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-900">
                          {testResult.emailsThatWouldBeSent || 0}
                        </div>
                        <div className="text-sm text-purple-700">
                          Emails to Send
                        </div>
                      </div>
                    </div>

                    {testResult.emailPreviews && testResult.emailPreviews.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Email Previews:</h4>
                        <div className="space-y-3">
                          {testResult.emailPreviews.map((email: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="font-medium text-gray-900">
                                To: {email.to}
                              </div>
                              <div className="text-sm text-gray-600">
                                Subject: {email.subject}
                              </div>
                              <div className="text-sm text-gray-600">
                                Agreements: {email.agreementsCount}
                              </div>
                              <details className="mt-2">
                                <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-500">
                                  View Email Body
                                </summary>
                                <pre className="mt-2 text-xs bg-white p-2 rounded border border-gray-300 whitespace-pre-wrap">
                                  {email.body}
                                </pre>
                              </details>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {testResult.note && (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                        {testResult.note}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Test run at: {testResult.timestamp}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* System Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">How it Works:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Runs daily at 00:00 UTC</li>
                    <li>• Checks for agreements expiring in 30 days</li>
                    <li>• Only sends to Pro users with alerts enabled</li>
                    <li>• Groups multiple agreements per user</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Production Setup:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Supabase Edge Function for automation</li>
                    <li>• Resend for email delivery</li>
                    <li>• Cron job triggers daily check</li>
                    <li>• Error logging and retry logic</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}