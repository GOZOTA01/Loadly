import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useAuthStore } from '@/store/authStore'
import { Colors } from '@/lib/colors'

export default function DriverProfileScreen() {
  const { profile, signOut } = useAuthStore()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.full_name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{profile?.full_name}</Text>
        <Text style={styles.role}>Driver</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      <View style={styles.section}>
        <MenuItem label="My Vehicle" emoji="🚛" onPress={() => Alert.alert('Coming soon')} />
        <MenuItem label="Documents" emoji="📄" onPress={() => Alert.alert('Coming soon')} />
        <MenuItem label="Bank Account" emoji="🏦" onPress={() => Alert.alert('Coming soon')} />
        <MenuItem label="Help & Support" emoji="❓" onPress={() => Alert.alert('Coming soon')} />
      </View>

      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={() => Alert.alert('Sign out', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign out', style: 'destructive', onPress: signOut },
        ])}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

function MenuItem({ label, emoji, onPress }: { label: string; emoji: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  card: { backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 24, alignItems: 'center', gap: 4 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  avatarText: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  name: { fontSize: 20, fontWeight: '800', color: Colors.text },
  role: { fontSize: 13, fontWeight: '600', color: Colors.primary, backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 20 },
  email: { fontSize: 14, color: Colors.textMuted },
  section: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuEmoji: { fontSize: 18, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '500' },
  menuArrow: { fontSize: 20, color: Colors.textMuted },
  signOutBtn: { margin: 16, marginTop: 24, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.error },
  signOutText: { color: Colors.error, fontWeight: '700', fontSize: 15 },
})
