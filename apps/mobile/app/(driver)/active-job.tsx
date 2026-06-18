import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Colors } from '@/lib/colors'
import { BOOKING_STATUS_LABEL, DRIVER_STATUS_SEQUENCE } from '@loadly/shared'
import type { Booking, BookingStatus } from '@loadly/shared'

export default function ActiveJobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      const { data } = await supabase.from('bookings').select('*').eq('id', id).single()
      setBooking(data as Booking)
    }
    fetch()

    const channel = supabase
      .channel(`booking-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${id}` }, (p) => setBooking(p.new as Booking))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  if (!booking) return (
    <View style={styles.center}>
      <Text style={styles.noJob}>No active job</Text>
      <Text style={styles.noJobSub}>Accept a job from the Jobs tab to see it here</Text>
    </View>
  )

  const currentIdx = DRIVER_STATUS_SEQUENCE.indexOf(booking.status as BookingStatus)
  const nextStatus = DRIVER_STATUS_SEQUENCE[currentIdx + 1]

  const advanceStatus = async () => {
    if (!nextStatus) return
    await supabase.from('bookings').update({ status: nextStatus }).eq('id', booking.id)
  }

  const openMaps = (address: string) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`
    Linking.openURL(url)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Job</Text>
        <Text style={styles.statusBadge}>{BOOKING_STATUS_LABEL[booking.status]}</Text>
      </View>

      <View style={styles.route}>
        <TouchableOpacity style={styles.routeRow} onPress={() => openMaps(booking.pickup_address)}>
          <Text style={styles.routeDot}>🟠</Text>
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>PICKUP</Text>
            <Text style={styles.routeAddress}>{booking.pickup_address}</Text>
          </View>
          <Text style={styles.navIcon}>↗</Text>
        </TouchableOpacity>
        <View style={styles.routeLine} />
        <TouchableOpacity style={styles.routeRow} onPress={() => openMaps(booking.dropoff_address)}>
          <Text style={styles.routeDot}>🟢</Text>
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>DROPOFF</Text>
            <Text style={styles.routeAddress}>{booking.dropoff_address}</Text>
          </View>
          <Text style={styles.navIcon}>↗</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <Detail label="Goods" value={booking.goods_type.replace(/_/g, ' ')} />
        {booking.helper_count > 0 && <Detail label="Helpers" value={`${booking.helper_count} helpers requested`} />}
        {booking.distance_km && <Detail label="Distance" value={`${booking.distance_km} km`} />}
        <Detail label="Payout" value={booking.total_amount ? `$${(+booking.total_amount * 0.9).toFixed(2)}` : '—'} />
      </View>

      <View style={styles.actions}>
        {nextStatus && (
          <TouchableOpacity style={styles.advanceBtn} onPress={advanceStatus}>
            <Text style={styles.advanceBtnText}>
              Mark as: {BOOKING_STATUS_LABEL[nextStatus]}
            </Text>
          </TouchableOpacity>
        )}
        {booking.status === 'delivered' && (
          <TouchableOpacity style={styles.completeBtn} onPress={async () => {
            await supabase.from('bookings').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', booking.id)
            router.replace('/(driver)/home')
          }}>
            <Text style={styles.completeBtnText}>Complete Job</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, padding: 32 },
  noJob: { fontSize: 18, fontWeight: '700', color: Colors.text },
  noJobSub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  statusBadge: { fontSize: 13, fontWeight: '700', color: Colors.primary, backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  route: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16, gap: 4 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  routeDot: { fontSize: 16 },
  routeInfo: { flex: 1 },
  routeLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5 },
  routeAddress: { fontSize: 14, fontWeight: '600', color: Colors.text },
  routeLine: { height: 16, width: 1.5, backgroundColor: Colors.border, marginLeft: 19 },
  navIcon: { fontSize: 18, color: Colors.primary, fontWeight: '700' },
  details: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailLabel: { fontSize: 14, color: Colors.textMuted },
  detailValue: { fontSize: 14, fontWeight: '700', color: Colors.text, textTransform: 'capitalize' },
  actions: { padding: 16, gap: 12, marginTop: 'auto' },
  advanceBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  advanceBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  completeBtn: { backgroundColor: Colors.success, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
})
