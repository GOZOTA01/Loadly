import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Booking } from '@loadly/shared'

const ACTIVE_STATUSES = [
  'pending',
  'assigned',
  'driver_en_route',
  'arrived_pickup',
  'loading',
  'in_transit',
  'arrived_dropoff',
  'unloading',
  'delivered',
]

export function useActiveBooking() {
  const { session } = useAuthStore()
  const [booking, setBooking] = useState<Booking | null>(null)

  useEffect(() => {
    if (!session) return

    const fetchActive = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', session.user.id)
        .in('status', ACTIVE_STATUSES)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      setBooking(data as Booking | null)
    }

    fetchActive()

    const channel = supabase
      .channel(`customer-bookings-${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `customer_id=eq.${session.user.id}` }, (payload) => {
        const updated = payload.new as Booking
        if (ACTIVE_STATUSES.includes(updated.status)) {
          setBooking(updated)
        } else {
          setBooking(null)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  return { booking }
}
