import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { Colors } from '@/lib/colors'

export default function DriverLayout() {
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
      <Tabs.Screen name="home" options={{ title: 'Jobs', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🚛</Text> }} />
      <Tabs.Screen name="active-job" options={{ title: 'Active', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📍</Text> }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: () => <Text style={{ fontSize: 20 }}>💰</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }} />
    </Tabs>
  )
}
