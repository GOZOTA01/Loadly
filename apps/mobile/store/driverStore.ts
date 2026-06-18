import { create } from 'zustand'
import * as Location from 'expo-location'
import { supabase } from '@/lib/supabase'

interface DriverState {
  isOnline: boolean
  locationSubscription: Location.LocationSubscription | null
  toggleOnline: () => Promise<void>
  startLocationTracking: (userId: string) => Promise<void>
  stopLocationTracking: () => void
}

export const useDriverStore = create<DriverState>((set, get) => ({
  isOnline: false,
  locationSubscription: null,

  toggleOnline: async () => {
    const { isOnline } = get()
    const newState = !isOnline
    set({ isOnline: newState })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return

    await supabase
      .from('driver_profiles')
      .update({ is_online: newState })
      .eq('user_id', session.user.id)

    if (newState) {
      await get().startLocationTracking(session.user.id)
    } else {
      get().stopLocationTracking()
    }
  },

  startLocationTracking: async (userId: string) => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return

    const subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 20 },
      async (location) => {
        await supabase.from('driver_profiles').update({
          current_lat: location.coords.latitude,
          current_lng: location.coords.longitude,
          last_location_at: new Date().toISOString(),
        }).eq('user_id', userId)
      },
    )

    set({ locationSubscription: subscription })
  },

  stopLocationTracking: () => {
    const { locationSubscription } = get()
    locationSubscription?.remove()
    set({ locationSubscription: null })
  },
}))
