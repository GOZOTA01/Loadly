import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Colors } from '@/lib/colors'
import type { DriverEarning } from '@loadly/shared'

export default function EarningsScreen() {
  const { session } = useAuthStore()

  const { data: earnings, isLoading } = useQuery({
    queryKey: ['driver-earnings', session?.user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('driver_earnings')
        .select('*')
        .eq('driver_id', session!.user.id)
        .order('created_at', { ascending: false })
      return (data ?? []) as DriverEarning[]
    },
    enabled: !!session,
  })

  const totalNet = earnings?.reduce((sum, e) => sum + Number(e.net_amount), 0) ?? 0
  const pendingNet = earnings?.filter((e) => e.payout_status === 'pending').reduce((sum, e) => sum + Number(e.net_amount), 0) ?? 0

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryAmount}>${totalNet.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total earned</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardRight]}>
          <Text style={styles.summaryAmount}>${pendingNet.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Pending payout</Text>
        </View>
      </View>

      <FlatList
        data={earnings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💰</Text>
            <Text style={styles.emptyText}>No earnings yet</Text>
            <Text style={styles.emptySubText}>Complete your first delivery to start earning</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.earningRow}>
            <View>
              <Text style={styles.earningDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
              <Text style={styles.earningStatus}>{item.payout_status === 'paid' ? '✅ Paid' : '⏳ Pending'}</Text>
            </View>
            <View style={styles.earningAmounts}>
              <Text style={styles.earningNet}>${Number(item.net_amount).toFixed(2)}</Text>
              <Text style={styles.earningGross}>Gross ${Number(item.gross_amount).toFixed(2)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  )
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
  summary: { flexDirection: 'row', margin: 16, gap: 12 },
  summaryCard: { flex: 1, backgroundColor: Colors.primary, borderRadius: 16, padding: 20 },
  summaryCardRight: { backgroundColor: Colors.secondary ?? '#1A1A2E' },
  summaryAmount: { fontSize: 24, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  list: { paddingHorizontal: 16, gap: 2 },
  empty: { marginTop: 60, alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySubText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },
  earningRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderRadius: 12,
    marginBottom: 2,
  },
  earningDate: { fontSize: 14, fontWeight: '600', color: Colors.text },
  earningStatus: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  earningAmounts: { alignItems: 'flex-end' },
  earningNet: { fontSize: 18, fontWeight: '800', color: Colors.text },
  earningGross: { fontSize: 12, color: Colors.textMuted },
})
