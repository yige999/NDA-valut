'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format, differenceInDays, parseISO } from 'date-fns'
import { Trash2, FileText, Bell, BellOff, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

// 定义接口，防止 TS 报错
interface Agreement {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_url?: string // 兼容字段
  file_size: number
  counterparty_name: string
  expiration_date: string
  status: string
  alert_enabled: boolean
  created_at: string
}

export default function NDAList({ user }: { user: any }) {
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgreements()
  }, [])

  const fetchAgreements = async () => {
    const { data, error } = await supabase
      .from('agreements')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setAgreements(data as Agreement[])
    setLoading(false)
  }

  // --- 修复后的删除逻辑 Start ---
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this NDA?')) return

    // 1. 正确逻辑：先找到对象
    const agreementToDelete = agreements.find((a) => a.id === id)
    
    if (!agreementToDelete) {
      console.error('Agreement not found in local state')
      return
    }

    // 2. 获取路径 (兼容处理)
    const filePath = agreementToDelete.file_url || agreementToDelete.file_path

    // 3. 删文件
    if (filePath) {
        const { error: storageError } = await supabase.storage
        .from('nda-files') // 确保桶名字是对的
        .remove([filePath])
        
        if (storageError) console.error('Storage delete error:', storageError)
    }

    // 4. 删数据库
    const { error: dbError } = await supabase
      .from('agreements')
      .delete()
      .eq('id', id)

    if (dbError) {
      alert('Error deleting record: ' + dbError.message)
    } else {
      setAgreements(agreements.filter((a) => a.id !== id))
    }
  }
  // --- 修复后的删除逻辑 End ---

  // 状态辅助函数
  const getStatus = (dateStr: string) => {
    if (!dateStr) return { label: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: Clock }
    const days = differenceInDays(parseISO(dateStr), new Date())
    if (days < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
    if (days <= 30) return { label: `Expiring in ${days}d`, color: 'bg-orange-100 text-orange-700', icon: Clock }
    return { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle }
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm mt-8">
      <div className="border-b px-6 py-4 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800">Your Agreements ({agreements.length})</h2>
        {loading && <Loader2 className="animate-spin text-slate-400 w-4 h-4" />}
      </div>
      
      {agreements.length === 0 && !loading ? (
        <div className="p-12 text-center text-slate-500">No agreements found. Upload one above!</div>
      ) : (
        <div className="divide-y">
          {agreements.map((item) => {
            const status = getStatus(item.expiration_date)
            const StatusIcon = status.icon

            return (
              <div key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 transition">
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded bg-blue-50 p-2 text-blue-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{item.counterparty_name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <span>{item.file_name}</span>
                      <span className="text-xs text-slate-400">• Uploaded {format(parseISO(item.created_at), 'MMM d, yyyy')}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-8">
                  <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                    <StatusIcon className="w-3 h-3" /> {status.label}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 铃铛按钮 (支付入口) */}
                    <button 
                      onClick={() => window.open('https://www.creem.io/test/payment/prod_214QyTzfsLnEh3yrHHI0IG', '_blank')} 
                      className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                      title="Enable Alerts"
                    >
                      {item.alert_enabled ? <Bell className="h-4 w-4 text-blue-600" /> : <BellOff className="h-4 w-4" />}
                    </button>

                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
