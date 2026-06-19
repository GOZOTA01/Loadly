'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export function ApproveDriverButton({ driverId }: { driverId: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient()
  const router = useRouter()

  const update = async (status: 'approved' | 'rejected') => {
    setLoading(true)
    await supabase
      .from('driver_profiles')
      .update({ approval_status: status })
      .eq('user_id', driverId)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => update('approved')}
        disabled={loading}
        className="px-3 py-1.5 text-white text-xs font-bold rounded-lg disabled:opacity-50 hover:opacity-90" style={{ backgroundColor: '#3D5166' }}
      >
        Approve
      </button>
      <button
        onClick={() => update('rejected')}
        disabled={loading}
        className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  )
}
