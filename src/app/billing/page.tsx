'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  CreditCardIcon,
  DocumentTextIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function BillingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadBillingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load subscription status
        const subscriptionResponse = await fetch('/api/subscriptions/status');
        if (!subscriptionResponse.ok) {
          throw new Error('Failed to load subscription status');
        }

        // Load invoice history (this would be implemented based on Creem's API)
        // For now, we'll use mock data
        setInvoices([
          {
            id: 'inv_123',
            date: '2024-01-15',
            amount: 49,
            status: 'paid',
            description: 'Pro Plan - Monthly',
          },
          {
            id: 'inv_124',
            date: '2024-02-15',
            amount: 49,
            status: 'paid',
            description: 'Pro Plan - Monthly',
          },
        ]);

      } catch (err) {
        console.error('Failed to load billing data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, [user]);

  const handleUpdatePaymentMethod = () => {
    // This would open Creem's customer portal or a custom payment method update form
    window.location.href = '/billing/payment-method';
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      // This would call Creem's API to download the invoice
      const response = await fetch(`/api/billing/invoices/${invoiceId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      alert('Failed to download invoice. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
              <p className="text-gray-600 mt-1">
                Manage your subscription and payment methods
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subscription Status */}
            <SubscriptionStatus />

            {/* Payment Method */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpdatePaymentMethod}
                >
                  Update
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <CreditCardIcon className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/24</p>
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
              {invoices.length === 0 ? (
                <p className="text-gray-500">No invoices available</p>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{invoice.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(invoice.date).toLocaleDateString()} • {invoice.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">${invoice.amount}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/pricing'}
                >
                  <ArrowRightIcon className="w-4 h-4 mr-2" />
                  Change Plan
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleUpdatePaymentMethod}
                >
                  <CreditCardIcon className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/support'}
                >
                  Support
                </Button>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-4">
                Have questions about your subscription or billing? Our support team is here to help.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/support'}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}