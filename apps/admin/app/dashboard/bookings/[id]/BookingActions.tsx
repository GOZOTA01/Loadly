'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'

export function BookingActions({
  bookingId,
  status,
  paymentStatus,
}: {
  bookingId: string
  status: string
  paymentStatus: string
}) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState<'cancel' | 'refund' | null>(null)
  const [error, setError] = useState('')

  const cancelBooking = async () => {
    if (!confirm('Cancel this booking? This cannot be undone.')) return
    setLoading('cancel')
    setError('')

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    setLoading(null)
    if (updateError) { setError(updateError.message); return }
    router.refresh()
  }

  const markRefunded = async () => {
    if (!confirm('Mark this booking payment as refunded?')) return
    setLoading('refund')
    setError('')

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ payment_status: 'refunded' })
      .eq('id', bookingId)

    setLoading(null)
    if (updateError) { setError(updateError.message); return }
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {status !== 'cancelled' && (
        <button
          onClick={cancelBooking}
          disabled={loading !== null}
          className="w-full py-3 rounded-xl text-red-600 text-sm font-bold border-2 border-red-100 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          {loading === 'cancel' ? 'Cancelling…' : 'Cancel Booking'}
        </button>
      )}

      {paymentStatus !== 'refunded' && paymentStatus !== 'pending' && (
        <button
          onClick={markRefunded}
          disabled={loading !== null}
          className="w-full py-3 rounded-xl text-gray-700 text-sm font-bold border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          {loading === 'refund' ? 'Processing…' : 'Mark as Refunded'}
        </button>
      )}

      {status === 'cancelled' && paymentStatus === 'refunded' && (
        <p className="text-sm text-gray-400 text-center py-2">No actions available</p>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <p className="text-[11px] text-gray-300 leading-relaxed">
        Refunds are recorded manually for MVP. Stripe refund integration can be added later.
      </p>
    </div>
  )
}
