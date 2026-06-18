import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { useActiveBooking } from '@/hooks/useActiveBooking'
import { Colors } from '@/lib/colors'
import { BOOKING_STATUS_LABEL } from '@loadly/shared'

export default function CustomerHomeScreen() {
  const router = useRouter()
  const { profile, signOut } = useAuthStore()
  const { booking } = useActiveBooking()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile?.full_name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>Where are we delivering today?</Text>
        </View>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.signOut}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {booking && (
        <TouchableOpacity
          style={styles.activeBookingCard}
          onPress={() => router.push(`/(customer)/tracking?id=${booking.id}`)}
        >
          <Text style={styles.activeBookingLabel}>Active delivery</Text>
          <Text style={styles.activeBookingStatus}>{BOOKING_STATUS_LABEL[booking.status]}</Text>
          <Text style={styles.activeBookingTap}>Tap to track →</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => router.push('/(customer)/new-booking/locations')}
      >
        <Text style={styles.bookButtonText}>+ New Delivery</Text>
      </TouchableOpacity>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>What are you moving?</Text>
        <View style={styles.categoryGrid}>
          {QUICK_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={styles.categoryCard}
              onPress={() =>
                router.push(
                  `/(customer)/new-booking/locations?goods_type=${cat.goodsType}`,
                )
              }
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const QUICK_CATEGORIES = [
  { emoji: '🛋️', label: 'Furniture', goodsType: 'furniture' },
  { emoji: '🧱', label: 'Bricks', goodsType: 'bricks_blocks' },
  { emoji: '🏗️', label: 'Materials', goodsType: 'building_materials' },
  { emoji: '📦', label: 'Boxes', goodsType: 'boxes_general' },
  { emoji: '🍳', label: 'Appliances', goodsType: 'appliances' },
  { emoji: '🏢', label: 'Office', goodsType: 'office_equipment' },
]

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  subGreeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  signOut: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  activeBookingCard: {
    margin: 16,
    backgroundColor: Colors.primaryDark,
    borderRadius: 16,
    padding: 20,
  },
  activeBookingLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  activeBookingStatus: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 4 },
  activeBookingTap: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8 },
  bookButton: {
    margin: 16,
    marginTop: booking => booking ? 0 : 16,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  bookButtonText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  categoriesSection: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryEmoji: { fontSize: 28 },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: Colors.text, marginTop: 6, textAlign: 'center' },
})
