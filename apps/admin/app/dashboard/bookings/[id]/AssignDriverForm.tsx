'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'

interface DriverOption {
  user_id: string
  full_name: string
  vehicle_id: string
  vehicle_label: string
}

export function AssignDriverForm({
  bookingId,
  drivers,
  currentDriverId,
}: {
  bookingId: string
  drivers: DriverOption[]
  currentDriverId: string | null
}) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [selected, setSelected] = useState(currentDriverId ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const assign = async () => {
    if (!selected) return
    setLoading(true)
    setError('')

    const driver = drivers.find((d) => d.user_id === selected)
    if (!driver) {
      setError('Invalid driver selection')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        driver_id: driver.user_id,
        vehicle_id: driver.vehicle_id,
        status: 'assigned',
      })
      .eq('id', bookingId)

    setLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }

    router.refresh()
  }

  if (drivers.length === 0) {
    return <p className="text-sm text-gray-400">No approved drivers with active vehicles available.</p>
  }

  return (
    <div className="space-y-3">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#FF6B35]"
      >
        <option value="">Select a driver…</option>
        {drivers.map((d) => (
          <option key={d.user_id} value={d.user_id}>
            {d.full_name} — {d.vehicle_label}
          </option>
        ))}
      </select>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        onClick={assign}
        disabled={loading || !selected}
        className="w-full py-3 rounded-xl text-white text-sm font-bold disabled:opacity-50 transition-opacity"
        style={{ backgroundColor: '#FF6B35' }}
      >
        {loading ? 'Assigning…' : currentDriverId ? 'Reassign Driver' : 'Assign Driver'}
      </button>
    </div>
  )
}
