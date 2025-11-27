'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import NDAUpload from '@/components/NDAUpload'
import NDAList from '@/components/NDAList'
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus'
import SubscriptionGuard from '@/components/guards/SubscriptionGuard'
import { Alert } from '@/components/ui/Alert'

function DashboardContent() {
  const { user, loading, signOut } = useAuth()
  const searchParams = useSearchParams()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleUploadSuccess = () => {
    // Trigger list refresh
    setRefreshTrigger(prev => prev + 1)
  }

  useEffect(() => {
    // Handle subscription success/error messages from URL params
    const subscription = searchParams.get('subscription')
    if (subscription === 'success') {
      setShowAlert({
        type: 'success',
        message: 'Subscription updated successfully! Welcome to Pro.'
      })
    } else if (subscription === 'error') {
      setShowAlert({
        type: 'error',
        message: 'There was an issue with your subscription. Please try again.'
      })
    } else if (subscription === 'canceled') {
      setShowAlert({
        type: 'success',
        message: 'Your subscription has been canceled.'
      })
    }

    // Clear alert after 5 seconds
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, showAlert])

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
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Go to sign in page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                NDAVault
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Home
              </Link>
              <Link
                href="/billing"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Billing
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Upgrade
              </Link>
              <span className="text-sm text-gray-700">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Alert Messages */}
          {showAlert && (
            <div className="mb-6">
              <Alert variant={showAlert.type} onClose={() => setShowAlert(null)}>
                {showAlert.message}
              </Alert>
            </div>
          )}

          {/* Subscription Status */}
          <div className="mb-8">
            <SubscriptionStatus compact={true} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  NDA Dashboard
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage your Non-Disclosure Agreements in one place
                </p>
              </div>

              {/* Upload Section */}
              <SubscriptionGuard>
                <NDAUpload onUploadSuccess={handleUploadSuccess} />
              </SubscriptionGuard>

              {/* List Section */}
              <NDAList refreshTrigger={refreshTrigger} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <SubscriptionStatus showActions={true} />

              {/* Quick Stats */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total NDAs</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiring Soon</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expired</span>
                    <span className="font-medium">—</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}