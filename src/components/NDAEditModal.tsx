'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Agreement {
  id: string
  file_name: string
  file_url: string
  file_size: number
  counterparty_name: string
  effective_date: string | null
  expiration_date: string
  confidentiality_period: number | null
  status: 'active' | 'expiring_soon' | 'expired'
  alert_enabled: boolean
  created_at: string
  updated_at: string
}

interface NDAEditModalProps {
  agreement: Agreement
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function NDAEditModal({ agreement, isOpen, onClose, onUpdate }: NDAEditModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    counterparty_name: agreement.counterparty_name,
    effective_date: agreement.effective_date || '',
    expiration_date: agreement.expiration_date,
    confidentiality_period: agreement.confidentiality_period?.toString() || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate required fields
    if (!formData.counterparty_name || !formData.expiration_date) {
      setError('Please fill in all required fields.')
      return
    }

    // Validate effective date is before expiration date
    if (formData.effective_date && formData.expiration_date) {
      const effectiveDate = new Date(formData.effective_date)
      const expirationDate = new Date(formData.expiration_date)

      if (effectiveDate >= expirationDate) {
        setError('Effective date must be before expiration date.')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      // Calculate new status
      const expirationDate = new Date(formData.expiration_date)
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)

      let status: 'active' | 'expiring_soon' | 'expired'
      if (expirationDate < today) {
        status = 'expired'
      } else if (expirationDate <= thirtyDaysFromNow) {
        status = 'expiring_soon'
      } else {
        status = 'active'
      }

      // Update agreement
      const { error: updateError } = await supabase
        .from('agreements')
        .update({
          counterparty_name: formData.counterparty_name,
          effective_date: formData.effective_date || null,
          expiration_date: formData.expiration_date,
          confidentiality_period: formData.confidentiality_period ? parseInt(formData.confidentiality_period) : null,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', agreement.id)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      onUpdate()
      onClose()
    } catch (error: any) {
      console.error('Update error:', error)
      setError(error.message || 'Failed to update NDA. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit NDA Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="counterparty_name" className="block text-sm font-medium text-gray-700">
              Counterparty Name *
            </label>
            <input
              type="text"
              id="counterparty_name"
              name="counterparty_name"
              value={formData.counterparty_name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="effective_date" className="block text-sm font-medium text-gray-700">
              Effective Date
            </label>
            <input
              type="date"
              id="effective_date"
              name="effective_date"
              value={formData.effective_date}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="expiration_date" className="block text-sm font-medium text-gray-700">
              Expiration Date *
            </label>
            <input
              type="date"
              id="expiration_date"
              name="expiration_date"
              value={formData.expiration_date}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="confidentiality_period" className="block text-sm font-medium text-gray-700">
              Confidentiality Period (years)
            </label>
            <input
              type="number"
              id="confidentiality_period"
              name="confidentiality_period"
              value={formData.confidentiality_period}
              onChange={handleInputChange}
              min="1"
              placeholder="e.g., 5"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional: How long the confidentiality obligation lasts
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}