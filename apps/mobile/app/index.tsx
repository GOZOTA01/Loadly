import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { Colors } from '@/lib/colors'

export default function IndexPage() {
  const { session, profile, loading } = useAuthStore()

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (!session) return <Redirect href="/auth/login" />

  if (profile?.role === 'driver') return <Redirect href="/(driver)/home" />

  return <Redirect href="/(customer)/home" />
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
})
