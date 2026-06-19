import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { TrendingUp, Truck, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const [
    { count: totalBookings },
    { count: activeBookings },
    { count: completedBookings },
    { count: pendingDrivers },
    { count: totalDrivers },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).not('status', 'in', '(completed,cancelled)'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
    supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('approval_status', 'approved'),
    supabase.from('bookings')
      .select('id, status, pickup_address, dropoff_address, total_amount, vehicle_category, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const completionRate = totalBookings ? Math.round(((completedBookings ?? 0) / totalBookings) * 100) : 0

  return (
    <div>
      <Header title="Dashboard" subtitle={`Today, ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`} />

      <div className="p-8 space-y-8">

        {/* Pending approvals banner */}
        {(pendingDrivers ?? 0) > 0 && (
          <Link href="/dashboard/drivers">
            <div className="flex items-center justify-between rounded-2xl px-5 py-4 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#FF6B35' }}>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-white" />
                <p className="text-white font-semibold text-sm">
                  {pendingDrivers} driver{(pendingDrivers ?? 0) > 1 ? 's' : ''} waiting for approval
                </p>
              </div>
              <div className="flex items-center gap-1 text-white text-sm font-bold">
                Review <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Total Bookings"
            value={totalBookings ?? 0}
            icon={<TrendingUp className="w-5 h-5" />}
            color="#3B82F6"
            bg="#EFF6FF"
          />
          <KpiCard
            label="Active Jobs"
            value={activeBookings ?? 0}
            icon={<Truck className="w-5 h-5" />}
            color="#FF6B35"
            bg="#FFF0EB"
            highlight
          />
          <KpiCard
            label="Completed"
            value={completedBookings ?? 0}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="#10B981"
            bg="#ECFDF5"
          />
          <KpiCard
            label="Completion Rate"
            value={`${completionRate}%`}
            icon={<Clock className="w-5 h-5" />}
            color="#8B5CF6"
            bg="#F5F3FF"
          />
        </div>

        {/* Two-column row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Recent bookings — 2 cols */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Recent Bookings</h2>
              <Link href="/dashboard/bookings"
                className="text-xs font-semibold text-[#FF6B35] hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(recentBookings ?? []).length === 0 && (
                <p className="text-center text-gray-300 py-12 text-sm">No bookings yet</p>
              )}
              {(recentBookings ?? []).map((b: any) => (
                <div key={b.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: vehicleColor(b.vehicle_category) }}
                  >
                    {vehicleEmoji(b.vehicle_category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{b.pickup_address}</p>
                    <p className="text-xs text-gray-400 truncate">→ {b.dropoff_address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={b.status} />
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(b.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fleet overview — 1 col */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Fleet Overview</h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Approved Drivers', value: totalDrivers ?? 0, color: '#10B981' },
                { label: 'Pending Approvals', value: pendingDrivers ?? 0, color: '#F59E0B' },
                { label: 'Active Jobs', value: activeBookings ?? 0, color: '#FF6B35' },
                { label: 'Jobs Completed', value: completedBookings ?? 0, color: '#3B82F6' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">{item.value}</span>
                </div>
              ))}

              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Completion rate</span>
                  <span className="font-bold text-gray-700">{completionRate}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${completionRate}%`, backgroundColor: '#10B981' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function KpiCard({ label, value, icon, color, bg, highlight }: {
  label: string; value: number | string; icon: React.ReactNode
  color: string; bg: string; highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl p-5 border transition-shadow hover:shadow-md ${highlight ? 'border-[#FF6B35]/20' : 'border-gray-100'}`}
      style={{ backgroundColor: highlight ? '#FFF0EB' : 'white' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg, color }}>
          {icon}
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-200" />
      </div>
      <p className="text-3xl font-black text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs font-medium text-gray-400 mt-1">{label}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    pending:       { bg: '#FEF9C3', text: '#854D0E', label: 'Pending' },
    assigned:      { bg: '#DBEAFE', text: '#1D4ED8', label: 'Assigned' },
    driver_en_route: { bg: '#EDE9FE', text: '#6D28D9', label: 'En Route' },
    loading:       { bg: '#FEF3C7', text: '#92400E', label: 'Loading' },
    in_transit:    { bg: '#EDE9FE', text: '#5B21B6', label: 'In Transit' },
    delivered:     { bg: '#D1FAE5', text: '#065F46', label: 'Delivered' },
    completed:     { bg: '#D1FAE5', text: '#065F46', label: 'Completed' },
    cancelled:     { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelled' },
  }
  const s = map[status] ?? { bg: '#F3F4F6', text: '#374151', label: status }
  return (
    <span className="inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {s.label}
    </span>
  )
}

function vehicleColor(cat: string) {
  const map: Record<string, string> = {
    pickup_van: '#3B82F6', truck_1t: '#10B981', truck_3t: '#FF6B35',
    truck_5t: '#8B5CF6', lorry: '#3A4A54',
  }
  return map[cat] ?? '#9CA3AF'
}

function vehicleEmoji(cat: string) {
  const map: Record<string, string> = {
    pickup_van: '🚐', truck_1t: '🚛', truck_3t: '🚚', truck_5t: '🚜', lorry: '🏗',
  }
  return map[cat] ?? '🚛'
}
