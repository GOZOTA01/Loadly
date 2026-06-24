'use client'

import { useState } from 'react'
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
    }}>

      {/* ── Top bar — Uber-style wordmark ── */}
      <header style={{
        backgroundColor: '#3A4A54',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        flexShrink: 0,
      }}>
        <span style={{
          color: '#ffffff',
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          Loadly
        </span>
      </header>

      {/* ── Page body ─────────────────────────────────── */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Heading */}
          <h1 style={{
            fontSize: 30,
            fontWeight: 900,
            color: '#111827',
            lineHeight: 1.25,
            marginBottom: 28,
            letterSpacing: '-0.5px',
          }}>
            What's your email<br />and password?
          </h1>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              autoComplete="email"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#FF6B35')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#FF6B35')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />

            {error && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 12,
                padding: '10px 14px',
                color: '#DC2626',
                fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                width: '100%',
                padding: '16px',
                backgroundColor: loading ? '#9CA3AF' : '#3A4A54',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.backgroundColor = '#FF6B35') }}
              onMouseLeave={e => { if (!loading) (e.currentTarget.style.backgroundColor = '#3A4A54') }}
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  Signing in…
                </>
              ) : 'Continue'}
            </button>

          </form>

          {/* Disclaimer */}
          <p style={{
            marginTop: 20,
            fontSize: 12,
            color: '#9CA3AF',
            lineHeight: 1.6,
          }}>
            This portal is for authorised Loadly admins only.
            Unauthorised access attempts are logged.
          </p>

        </div>
      </main>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#F3F4F6',
  border: '2px solid transparent',
  borderRadius: 12,
  padding: '15px 16px',
  fontSize: 14,
  color: '#111827',
  outline: 'none',
  transition: 'border-color 0.15s',
}

function SpinnerIcon() {
  return (
    <svg
      style={{ animation: 'spin 0.8s linear infinite', width: 16, height: 16, flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
