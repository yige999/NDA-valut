'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import NDAEditModal from './NDAEditModal'

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

interface NDAListProps {
  refreshTrigger?: number
}

export default function NDAList({ refreshTrigger }: NDAListProps) {
  const { user } = useAuth()
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingAgreement, setEditingAgreement] = useState<Agreement | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    fetchAgreements()
  }, [user, refreshTrigger])

  const fetchAgreements = async () => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('agreements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setAgreements(data || [])
    } catch (error: any) {
      console.error('Fetch error:', error)
      setError(error.message || 'Failed to fetch NDAs')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, fileName: string) => {
    if (!confirm('Are you sure you want to delete this NDA? This action cannot be undone.')) {
      return
    }

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('agreements')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError

      // Delete file from storage
      const filePath = `${user!.id}/${fileName.split('/').pop()}`
      const { error: storageError } = await supabase.storage
        .from('nda-files')
        .remove([filePath])

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError)
      }

      // Refresh list
      fetchAgreements()
    } catch (error: any) {
      console.error('Delete error:', error)
      setError(error.message || 'Failed to delete NDA')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'expired':
        return 'Expired'
      case 'expiring_soon':
        return 'Expiring Soon'
      case 'active':
        return 'Active'
      default:
        return 'Unknown'
    }
  }

  const handleEdit = (agreement: Agreement) => {
    setEditingAgreement(agreement)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingAgreement(null)
  }

  const handleUpdateSuccess = () => {
    fetchAgreements()
    handleCloseEditModal()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading NDAs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={fetchAgreements}
            className="mt-4 text-blue-600 hover:text-blue-500 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (agreements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H8a4 4 0 00-4 4v20m0 0v8a4 4 0 004 4h20m32-12v8m0 0v8a4 4 0 01-4 4H12m28-32a4 4 0 004 4v4m0 0v12m-20-12v12m-8-12v12" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No NDAs yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first NDA document.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Your NDAs ({agreements.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Counterparty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Effective Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiration Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alerts
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agreements.map((agreement) => (
              <tr key={agreement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {agreement.file_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(agreement.file_size)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {agreement.counterparty_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(agreement.effective_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(agreement.expiration_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(agreement.status)}`}>
                    {getStatusText(agreement.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => {
                      // Toggle Alert (Paywall Trigger)
                      if (!agreement.alert_enabled) {
                        // Open Creem payment link in new tab
                        window.open('https://pay.creem.io/payment/03a39489-f194-4ca6-a569-9463606e5195', '_blank');
                      }
                    }}
                    className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                      agreement.alert_enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {agreement.alert_enabled ? 'Enabled' : 'Enable'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a
                    href={agreement.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 mr-4"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleEdit(agreement)}
                    className="text-gray-600 hover:text-gray-500 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(agreement.id, agreement.file_url)}
                    className="text-red-600 hover:text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingAgreement && (
        <NDAEditModal
          agreement={editingAgreement}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateSuccess}
        />
      )}
    </div>
  )
}