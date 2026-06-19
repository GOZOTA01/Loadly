'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Truck,
  BookOpen,
  DollarSign,
  BarChart3,
  LogOut,
} from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/drivers', label: 'Drivers', icon: Users },
  { href: '/dashboard/vehicles', label: 'Vehicles', icon: Truck },
  { href: '/dashboard/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/dashboard/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-64 flex flex-col shrink-0 min-h-screen"
      style={{ backgroundColor: '#3D5166' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Image
          src="/logo.png"
          alt="Loadly"
          width={120}
          height={48}
          className="object-contain"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#FF6B35' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <form action="/auth/signout" method="post">
          <button
            type="button"
            onClick={() => (window.location.href = '/login')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </form>
        <p className="text-white/25 text-xs text-center mt-3">Loadly v0.1.0</p>
      </div>
    </aside>
  )
}
