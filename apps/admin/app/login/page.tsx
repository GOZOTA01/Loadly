'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase-browser'
import Image from 'next/image'

export default function AdminLoginPage() {
  const supabase = createBrowserClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'email') {
      if (!email) return
      setError('')
      setStep('password')
      return
    }
    handleLogin()
  }

  const handleLogin = async () => {
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

      {/* Top navbar */}
      <nav
        className="w-full px-6 py-4 flex items-center"
        style={{ backgroundColor: '#3A4A54' }}
      >
        <Image
          src="/logo.png"
          alt="Loadly"
          width={90}
          height={90}
          className="object-contain"
          priority
        />
      </nav>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[380px]">

          <h1 className="text-[28px] font-black text-gray-900 leading-tight mb-5">
            {step === 'email'
              ? "What's your email address?"
              : 'Enter your password'}
          </h1>

          <form onSubmit={handleContinue} className="space-y-3">

            {step === 'email' ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoFocus
                required
                className="w-full bg-gray-100 rounded-xl px-4 py-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-200 transition-colors"
              />
            ) : (
              <>
                {/* Show email as read-only chip */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500">{email}</span>
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setError('') }}
                    className="text-xs font-bold underline text-gray-400 hover:text-gray-600"
                  >
                    Edit
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  required
                  className="w-full bg-gray-100 rounded-xl px-4 py-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-200 transition-colors"
                />
              </>
            )}

            {error && (
              <p className="text-red-500 text-xs pt-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#1A1A1A' }}
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
                'Continue'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* SSO placeholder buttons */}
          <div className="space-y-3">
            <SsoButton
              icon={
                <svg viewBox="0 0 48 48" className="w-4 h-4">
                  <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.1 6.8 29.3 5 24 5 13 5 4 14 4 25s9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.1 6.8 29.3 5 24 5c-7.7 0-14.4 4.4-17.7 9.7z" />
                  <path fill="#4CAF50" d="M24 45c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 36.5 26.8 37 24 37c-5.2 0-9.6-2.9-11.3-7l-6.6 5C9.7 41 16.4 45 24 45z" />
                  <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.2 5.2C41.5 35.7 44 30.7 44 25c0-1.3-.1-2.7-.4-4z" />
                </svg>
              }
              label="Continue with Google"
              onClick={() => {}}
            />
            <SsoButton
              icon={
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              }
              label="Continue with Apple"
              onClick={() => {}}
            />
          </div>

          <p className="text-[11px] text-gray-400 mt-8 leading-relaxed">
            By continuing, you agree to Loadly's{' '}
            <span className="underline cursor-pointer">Terms of Service</span> and{' '}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

function SsoButton({
  icon, label, onClick,
}: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl py-3.5 text-sm font-semibold text-gray-800"
    >
      {icon}
      {label}
    </button>
  )
}
