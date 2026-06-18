import { View, Text, Switch, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useDriverStore } from '@/store/driverStore'
import { Colors } from '@/lib/colors'
import type { Booking } from '@loadly/shared'
import { VEHICLE_CATEGORY_LABEL } from '@loadly/shared'

export default function DriverHomeScreen() {
  const { profile } = useAuthStore()
  const { isOnline, toggleOnline } = useDriverStore()
  const [availableJobs, setAvailableJobs] = useState<Booking[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!isOnline) {
      setAvailableJobs([])
      return
    }
    const fetch = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20)
      setAvailableJobs((data as Booking[]) ?? [])
    }
    fetch()

    const channel = supabase
      .channel('available-jobs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        setAvailableJobs((prev) => [payload.new as Booking, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [isOnline])

  const handleAccept = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ driver_id: profile?.id, status: 'assigned' })
      .eq('id', bookingId)
      .eq('status', 'pending') // optimistic lock
    if (error) {
      Alert.alert('Job unavailable', 'Another driver just accepted this job.')
    } else {
      router.push(`/(driver)/active-job?id=${bookingId}`)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Jobs</Text>
        <View style={styles.onlineRow}>
          <Text style={[styles.onlineLabel, isOnline && styles.onlineLabelActive]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnline}
            trackColor={{ true: Colors.success, false: Colors.border }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {!isOnline ? (
        <View style={styles.offlineState}>
          <Text style={styles.offlineEmoji}>😴</Text>
          <Text style={styles.offlineText}>You're offline</Text>
          <Text style={styles.offlineSubText}>Go online to see available delivery jobs</Text>
        </View>
      ) : availableJobs.length === 0 ? (
        <View style={styles.offlineState}>
          <Text style={styles.offlineEmoji}>🔍</Text>
          <Text style={styles.offlineText}>No jobs nearby</Text>
          <Text style={styles.offlineSubText}>New jobs will appear here automatically</Text>
        </View>
      ) : (
        <FlatList
          data={availableJobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <View style={styles.jobRow}>
                <Text style={styles.jobAddress} numberOfLines={1}>
                  📍 {item.pickup_address}
                </Text>
                <Text style={styles.jobAddress} numberOfLines={1}>
                  🏁 {item.dropoff_address}
                </Text>
              </View>
              <View style={styles.jobMeta}>
                <Text style={styles.jobMetaText}>
                  {item.distance_km ? `${item.distance_km} km` : 'Calculating...'}
                </Text>
                {item.helper_count > 0 && (
                  <Text style={styles.helperBadge}>+{item.helper_count} helpers</Text>
                )}
                <Text style={styles.jobAmount}>
                  {item.total_amount ? `$${item.total_amount}` : '—'}
                </Text>
              </View>
              <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
                <Text style={styles.acceptBtnText}>Accept Job</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  onlineLabel: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  onlineLabelActive: { color: Colors.success },
  offlineState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  offlineEmoji: { fontSize: 48 },
  offlineText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  offlineSubText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },
  list: { padding: 16, gap: 12 },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  jobRow: { gap: 4 },
  jobAddress: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  jobMetaText: { fontSize: 13, color: Colors.textMuted },
  helperBadge: {
    backgroundColor: Colors.primaryLight,
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  jobAmount: { marginLeft: 'auto', fontSize: 18, fontWeight: '800', color: Colors.text },
  acceptBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
