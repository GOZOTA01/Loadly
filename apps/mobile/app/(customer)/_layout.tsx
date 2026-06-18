import { Tabs } from 'expo-router'
import { Colors } from '@/lib/colors'

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color }) => <TabIcon name="home" color={color} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: ({ color }) => <TabIcon name="list" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <TabIcon name="person" color={color} /> }} />
    </Tabs>
  )
}

// Inline placeholder icon — replace with expo vector icons after install
function TabIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, string> = { home: '🏠', list: '📋', person: '👤' }
  return null // swap for <Ionicons name={name} size={22} color={color} /> after expo install
}
