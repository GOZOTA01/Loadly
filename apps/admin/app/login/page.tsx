'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'

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
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] p-12"
        style={{ backgroundColor: '#3A4A54' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <TruckIcon />
          <span className="text-white text-2xl font-black tracking-widest">LOADLY</span>
        </div>

        {/* Center illustration text */}
        <div>
          <h2 className="text-white text-4xl font-black leading-tight max-w-sm">
            Move anything,<br />anywhere.
          </h2>
          <p className="text-white/50 mt-4 text-base max-w-xs leading-relaxed">
            Manage drivers, bookings, pricing, and your entire logistics operation from one place.
          </p>

          {/* Stat pills */}
          <div className="flex gap-3 mt-10 flex-wrap">
            {[
              { label: 'Vehicle types', value: '5' },
              { label: 'Status updates', value: '10' },
              { label: 'Real-time tracking', value: '✓' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl px-5 py-3">
                <p className="text-white text-xl font-black">{s.value}</p>
                <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/30 text-xs">© 2026 Loadly. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 bg-white">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <TruckIcon size={28} color="#3A4A54" />
          <span className="text-[#3A4A54] text-xl font-black tracking-widest">LOADLY</span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-3xl font-black text-gray-900">Welcome back</h1>
          <p className="text-gray-400 mt-1 text-sm">Sign in to your admin account</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#FF6B35] bg-gray-50 transition-colors placeholder-gray-300"
                placeholder="you@loadly.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#FF6B35] bg-gray-50 transition-colors placeholder-gray-300"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <span className="text-red-500 text-base mt-0.5">⚠</span>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              style={{ backgroundColor: loading ? '#aaa' : '#FF6B35' }}
            >
              {loading ? (
                <>
                  <Spinner />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-300 mt-8">
            Admin access only · Loadly v0.1
          </p>
        </div>
      </div>
    </div>
  )
}

function TruckIcon({ size = 36, color = 'white' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="12" width="22" height="16" rx="2" fill={color} opacity="0.9" />
      <path d="M26 16h6l4 6v6h-10V16z" fill={color} />
      <circle cx="11" cy="30" r="3" fill="#3A4A54" stroke={color} strokeWidth="1.5" />
      <circle cx="29" cy="30" r="3" fill="#3A4A54" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
