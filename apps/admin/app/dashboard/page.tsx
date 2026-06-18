import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { BookOpen, Truck, Users, DollarSign, Clock, CheckCircle } from 'lucide-react'

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
    supabase.from('bookings').select('id, status, pickup_address, dropoff_address, total_amount, created_at').order('created_at', { ascending: false }).limit(8),
  ])

  const stats = [
    { label: 'Total Bookings', value: totalBookings ?? 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Jobs', value: activeBookings ?? 0, icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completed', value: completedBookings ?? 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Approvals', value: pendingDrivers ?? 0, icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Operations overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-black text-gray-900">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Bookings</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 font-medium border-b border-gray-100">
              <th className="px-6 py-3">Pickup</th>
              <th className="px-6 py-3">Dropoff</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {(recentBookings ?? []).map((booking: any) => (
              <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 font-medium text-gray-800 max-w-[160px] truncate">{booking.pickup_address}</td>
                <td className="px-6 py-3 text-gray-600 max-w-[160px] truncate">{booking.dropoff_address}</td>
                <td className="px-6 py-3">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-3 font-bold text-gray-900">
                  {booking.total_amount ? `$${booking.total_amount}` : '—'}
                </td>
                <td className="px-6 py-3 text-gray-500">
                  {new Date(booking.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  const className = map[status] ?? 'bg-gray-100 text-gray-800'
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
