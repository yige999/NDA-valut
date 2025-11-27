'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface NDAFormData {
  counterparty_name: string
  effective_date: string
  expiration_date: string
  confidentiality_period: string
}

interface NDAUploadProps {
  onUploadSuccess?: () => void
}

export default function NDAUpload({ onUploadSuccess }: NDAUploadProps) {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<NDAFormData>({
    counterparty_name: '',
    effective_date: '',
    expiration_date: '',
    confidentiality_period: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['application/pdf']

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 10MB.')
      return false
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PDF files are allowed.')
      return false
    }

    return true
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (selectedFile: File) => {
    setError('')
    if (validateFile(selectedFile)) {
      setFile(selectedFile)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !user) return

    // Validate required fields
    if (!formData.counterparty_name || !formData.expiration_date) {
      setError('Please fill in all required fields.')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload file to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('nda-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Store the file path instead of public URL (since bucket is private)
      const filePath = fileName

      // Calculate agreement status
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

      // Insert record into agreements table
      const { error: dbError } = await supabase
        .from('agreements')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: filePath, // Store file path, not public URL
          file_size: file.size,
          counterparty_name: formData.counterparty_name,
          effective_date: formData.effective_date || null,
          expiration_date: formData.expiration_date,
          confidentiality_period: formData.confidentiality_period ? parseInt(formData.confidentiality_period) : null,
          status,
          alert_enabled: false,
        })

      if (dbError) throw dbError

      // Reset form
      setFile(null)
      setFormData({
        counterparty_name: '',
        effective_date: '',
        expiration_date: '',
        confidentiality_period: '',
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onUploadSuccess?.()
    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Failed to upload NDA. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New NDA</h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NDA File (PDF only, max 10MB)
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />

            {file ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m0 0v8a4 4 0 004 4h20m32-12v8m0 0v8a4 4 0 01-4 4H12m28-32a4 4 0 004 4v4m0 0v12m-20-12v12m-8-12v12" />
                </svg>
                <div className="text-sm text-gray-600">
                  <p>Drop your PDF file here, or click to browse</p>
                  <p className="text-xs text-gray-500 mt-1">PDF only, max 10MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
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
            placeholder="e.g., OpenAI, Inc."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setFile(null)
              setFormData({
                counterparty_name: '',
                effective_date: '',
                expiration_date: '',
                confidentiality_period: '',
              })
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
              setError('')
            }}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={!file || uploading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload NDA'}
          </button>
        </div>
      </form>
    </div>
  )
}