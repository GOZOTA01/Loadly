import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User } from '@loadly/shared'
import type { registerSchema } from '@loadly/shared'
import type { z } from 'zod'

interface AuthState {
  session: Session | null
  profile: User | null
  loading: boolean
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (data: z.infer<typeof registerSchema>) => Promise<string | null>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,

  initialize: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session })
      if (session) await get().refreshProfile()
      else set({ profile: null })
    })

    set({ session, loading: false })
    if (session) await get().refreshProfile()
  },

  signIn: async (email, password) => {
    set({ loading: true })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false })
    return error?.message ?? null
  },

  signUp: async (data) => {
    set({ loading: true })
    const { error: authError, data: authData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name, phone: data.phone, role: data.role } },
    })
    if (authError) {
      set({ loading: false })
      return authError.message
    }
    if (authData.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        role: data.role,
        status: 'active',
      })
      if (profileError) {
        set({ loading: false })
        return profileError.message
      }
    }
    set({ loading: false })
    return null
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, profile: null })
  },

  refreshProfile: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    set({ profile: data as User })
  },
}))
