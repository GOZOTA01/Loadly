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
    <div className="min-h-screen flex flex-col bg-white">

      {/* Top bar */}
      <header
        className="h-14 px-8 flex items-center shrink-0"
        style={{ backgroundColor: '#3A4A54' }}
      >
        <Image
          src="/logo.png"
          alt="Loadly"
          width={90}
          height={36}
          className="object-contain"
          priority
        />
      </header>

      {/* Page body */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[360px]">

          <h1 className="text-[28px] font-black text-gray-900 leading-snug mb-6">
            What's your email<br />and password?
          </h1>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              autoComplete="email"
              className="w-full bg-gray-100 rounded-xl px-4 py-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full bg-gray-100 rounded-xl px-4 py-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all"
            />

            {error && (
              <p className="text-red-500 text-xs bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white text-sm font-bold transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#3A4A54' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>

          <p className="text-[11px] text-gray-400 mt-6 leading-relaxed">
            This portal is for authorised Loadly admins only.
            Unauthorised access attempts are logged.
          </p>
        </div>
      </main>
    </div>
  )
}
