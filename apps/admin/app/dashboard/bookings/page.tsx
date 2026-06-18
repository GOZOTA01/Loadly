import { createServerClient } from '@/lib/supabase-server'

export default async function BookingsPage() {
  const supabase = await createServerClient()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, status, pickup_address, dropoff_address, total_amount, vehicle_category, helper_count, created_at, customer_id')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">All delivery bookings</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 font-medium border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3">Pickup</th>
              <th className="px-6 py-3">Dropoff</th>
              <th className="px-6 py-3">Vehicle</th>
              <th className="px-6 py-3">Helpers</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {(bookings ?? []).map((b: any) => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800 max-w-[140px] truncate">{b.pickup_address}</td>
                <td className="px-6 py-3 text-gray-600 max-w-[140px] truncate">{b.dropoff_address}</td>
                <td className="px-6 py-3 text-gray-600 capitalize">{b.vehicle_category?.replace(/_/g, ' ')}</td>
                <td className="px-6 py-3 text-center">{b.helper_count > 0 ? <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">+{b.helper_count}</span> : <span className="text-gray-400">—</span>}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(b.status)}`}>
                    {b.status?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-3 font-bold">{b.total_amount ? `$${b.total_amount}` : '—'}</td>
                <td className="px-6 py-3 text-gray-500">{new Date(b.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!bookings?.length && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No bookings yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}
