import { createServerClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/Header'

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
    <div>
      <Header title="Analytics" subtitle="Business performance overview" />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-3xl font-black text-gray-900">{s.value}{s.suffix}</p>
              <p className="text-sm text-gray-400 mt-2 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center justify-center gap-3">
          <div className="text-4xl">📊</div>
          <p className="text-gray-500 font-semibold text-sm">Charts coming soon</p>
          <p className="text-gray-300 text-xs text-center max-w-xs">
            Time-series charts for revenue and bookings will be added in the next release.
          </p>
        </div>
      </div>
    </div>
  )
}
