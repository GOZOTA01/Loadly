import { createServerClient } from '@/lib/supabase-server'

export default async function AnalyticsPage() {
  const supabase = await createServerClient()

  const [
    { count: totalBookings },
    { count: completedBookings },
    { count: cancelledBookings },
    { count: totalDrivers },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('approval_status', 'approved'),
    supabase.from('driver_earnings').select('net_amount').eq('payout_status', 'pending'),
  ])

  const completionRate = totalBookings ? Math.round(((completedBookings ?? 0) / totalBookings) * 100) : 0
  const pendingRevenue = revenueData?.reduce((sum, r) => sum + Number(r.net_amount), 0) ?? 0

  const stats = [
    { label: 'Total Bookings', value: totalBookings ?? 0, suffix: '' },
    { label: 'Completed', value: completedBookings ?? 0, suffix: '' },
    { label: 'Completion Rate', value: completionRate, suffix: '%' },
    { label: 'Cancelled', value: cancelledBookings ?? 0, suffix: '' },
    { label: 'Active Drivers', value: totalDrivers ?? 0, suffix: '' },
    { label: 'Pending Payouts', value: `$${pendingRevenue.toFixed(2)}`, suffix: '' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Business performance overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-3xl font-black text-gray-900">{s.value}{s.suffix}</p>
            <p className="text-sm text-gray-500 mt-2 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-gray-400 text-sm text-center py-8">
          Charts and time-series data coming in the next release.<br />
          Connect a charting library like Recharts to <code className="bg-gray-100 px-1 rounded">driver_earnings</code> and <code className="bg-gray-100 px-1 rounded">bookings</code> tables.
        </p>
      </div>
    </div>
  )
}
