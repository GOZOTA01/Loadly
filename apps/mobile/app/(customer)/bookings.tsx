import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Colors } from '@/lib/colors'
import { BOOKING_STATUS_LABEL } from '@loadly/shared'
import type { Booking } from '@loadly/shared'

export default function CustomerBookingsScreen() {
  const { session } = useAuthStore()
  const router = useRouter()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['customer-bookings', session?.user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', session!.user.id)
        .order('created_at', { ascending: false })
      return (data ?? []) as Booking[]
    },
    enabled: !!session,
  })

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubText}>Your delivery history will appear here</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/(customer)/booking-detail?id=${item.id}`)}>
            <View style={styles.cardRow}>
              <Text style={styles.address} numberOfLines={1}>📍 {item.pickup_address}</Text>
              <Text style={[styles.status, statusColor(item.status)]}>{BOOKING_STATUS_LABEL[item.status]}</Text>
            </View>
            <Text style={styles.address} numberOfLines={1}>🏁 {item.dropoff_address}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
              {item.total_amount && <Text style={styles.amount}>${item.total_amount}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

function statusColor(status: string) {
  if (['completed'].includes(status)) return { color: Colors.success }
  if (['cancelled'].includes(status)) return { color: Colors.error }
  if (['pending'].includes(status)) return { color: Colors.warning }
  return { color: Colors.primary }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  list: { padding: 16, gap: 12 },
  empty: { marginTop: 80, alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySubText: { fontSize: 14, color: Colors.textMuted },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  address: { fontSize: 14, color: Colors.text, fontWeight: '500', flex: 1 },
  status: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  date: { fontSize: 12, color: Colors.textMuted },
  amount: { fontSize: 15, fontWeight: '800', color: Colors.text },
})
