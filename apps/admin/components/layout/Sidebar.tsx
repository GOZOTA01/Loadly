'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Truck,
  BookOpen,
  DollarSign,
  BarChart3,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { clsx } from 'clsx'
import { createBrowserClient } from '@/lib/supabase-browser'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/drivers', label: 'Drivers', icon: Users },
  { href: '/dashboard/vehicles', label: 'Vehicles', icon: Truck },
  { href: '/dashboard/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/dashboard/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const supabase = createBrowserClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside
      className="w-64 shrink-0 flex flex-col h-screen sticky top-0"
      style={{ backgroundColor: '#3A4A54' }}
    >
      {/* Logo */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <TruckIcon />
          <span className="text-white text-lg font-black tracking-[0.2em]">LOADLY</span>
        </div>
        <div
          className="mt-4 h-px w-full opacity-20"
          style={{ backgroundColor: 'white' }}
        />
      </div>

      {/* Nav label */}
      <p className="px-6 text-[10px] font-bold tracking-[0.15em] uppercase mb-2"
        style={{ color: 'rgba(255,255,255,0.35)' }}>
        Main Menu
      </p>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
              )}
              style={active ? { backgroundColor: '#FF6B35' } : {}}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-6 pt-4 space-y-1">
        <div
          className="h-px w-full mb-3 opacity-10"
          style={{ backgroundColor: 'white' }}
        />

        {/* User pill */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
            style={{ backgroundColor: '#FF6B35', color: 'white' }}
          >
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Admin</p>
            <p className="text-white/40 text-[10px] truncate">Loadly Admin</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-white/40 hover:text-white hover:bg-white/5"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}

function TruckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="12" width="22" height="16" rx="2" fill="white" opacity="0.9" />
      <path d="M26 16h6l4 6v6h-10V16z" fill="white" />
      <circle cx="11" cy="30" r="3" fill="#3A4A54" stroke="white" strokeWidth="1.5" />
      <circle cx="29" cy="30" r="3" fill="#3A4A54" stroke="white" strokeWidth="1.5" />
    </svg>
  )
}
