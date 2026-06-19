import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { BookOpen, Truck, Clock, CheckCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const [
    { count: totalBookings },
    { count: activeBookings },
    { count: completedBookings },
    { count: pendingDrivers },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).not('status', 'in', '(completed,cancelled)'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
    supabase.from('bookings')
      .select('id, status, pickup_address, dropoff_address, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const stats = [
    {
      label: 'Total Bookings',
      value: totalBookings ?? 0,
      icon: BookOpen,
      accent: '#3D5166',
      bg: '#EEF2F6',
    },
    {
      label: 'Active Jobs',
      value: activeBookings ?? 0,
      icon: Truck,
      accent: '#FF6B35',
      bg: '#FFF0EB',
    },
    {
      label: 'Completed',
      value: completedBookings ?? 0,
      icon: CheckCircle,
      accent: '#10B981',
      bg: '#ECFDF5',
    },
    {
      label: 'Pending Approvals',
      value: pendingDrivers ?? 0,
      icon: Clock,
      accent: '#F59E0B',
      bg: '#FFFBEB',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black" style={{ color: '#1A2332' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#64748B' }}>Welcome back. Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 border shadow-sm"
            style={{ borderColor: '#E2E8F0' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: stat.bg }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
            </div>
            <p className="text-3xl font-black" style={{ color: '#1A2332' }}>
              {stat.value.toLocaleString()}
            </p>
            <p className="text-xs font-semibold mt-1 uppercase tracking-wide" style={{ color: '#64748B' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#F1F5F9' }}>
          <h2 className="font-bold" style={{ color: '#1A2332' }}>Recent Bookings</h2>
          <a
            href="/dashboard/bookings"
            className="text-xs font-semibold hover:underline"
            style={{ color: '#3D5166' }}
          >
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs font-semibold uppercase tracking-wide"
                style={{ backgroundColor: '#F8FAFC', color: '#64748B' }}
              >
                <th className="px-6 py-3">Pickup</th>
                <th className="px-6 py-3">Dropoff</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentBookings ?? []).map((booking: any) => (
                <tr
                  key={booking.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#F1F5F9' }}
                >
                  <td className="px-6 py-3.5 font-medium max-w-[160px] truncate" style={{ color: '#1A2332' }}>
                    {booking.pickup_address}
                  </td>
                  <td className="px-6 py-3.5 max-w-[160px] truncate" style={{ color: '#64748B' }}>
                    {booking.dropoff_address}
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-3.5 font-bold" style={{ color: '#1A2332' }}>
                    {booking.total_amount ? `$${booking.total_amount}` : '—'}
                  </td>
                  <td className="px-6 py-3.5 text-xs" style={{ color: '#64748B' }}>
                    {new Date(booking.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!recentBookings?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center" style={{ color: '#64748B' }}>
                    No bookings yet — they'll appear here once customers start booking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    pending:     { bg: '#FFFBEB', color: '#92400E' },
    assigned:    { bg: '#EEF2F6', color: '#3D5166' },
    in_transit:  { bg: '#EDE9FE', color: '#5B21B6' },
    completed:   { bg: '#ECFDF5', color: '#065F46' },
    cancelled:   { bg: '#FEF2F2', color: '#991B1B' },
    delivered:   { bg: '#F0FDF4', color: '#166534' },
  }
  const s = styles[status] ?? { bg: '#F1F5F9', color: '#475569' }
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}
