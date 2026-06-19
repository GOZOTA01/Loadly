'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase-browser'
import Image from 'next/image'

export default function AdminLoginPage() {
  const supabase = createBrowserClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Access denied. Admin accounts only.')
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#3A4A54' }}
    >
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="Loadly"
          width={180}
          height={180}
          className="object-contain"
          priority
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl px-8 py-9">

        <h1 className="text-xl font-black text-gray-900 text-center">Sign in to Admin</h1>
        <p className="text-gray-400 text-sm text-center mt-1 mb-7">
          Loadly operations dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#FF6B35] transition-colors"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#FF6B35] transition-colors"
          />

          {error && (
            <p className="text-red-500 text-xs text-center bg-red-50 rounded-xl py-2.5 px-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            style={{ backgroundColor: '#FF6B35' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      <p className="text-white/20 text-xs mt-8">© 2026 Loadly · Admin access only</p>
    </div>
  )
}
