import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { requireAdmin } from '@/lib/require-admin'

export default async function BookingsPage() {
  const { supabase } = await requireAdmin()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, status, pickup_address, dropoff_address, total_amount, vehicle_category, helper_count, created_at, customer_id')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <Header title="Bookings" subtitle="All delivery requests" />
      <div className="p-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pickup</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Dropoff</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Helpers</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(bookings ?? []).map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-6 py-3.5 font-medium text-gray-800 max-w-[150px]">
                    <Link href={`/dashboard/bookings/${b.id}`} className="block truncate hover:text-[#FF6B35]">
                      {b.pickup_address}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 text-gray-500 max-w-[150px] truncate">{b.dropoff_address}</td>
                  <td className="px-6 py-3.5 text-gray-600 capitalize text-xs font-semibold">{b.vehicle_category?.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-3.5 text-center">
                    {b.helper_count > 0
                      ? <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold">+{b.helper_count}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-3.5"><StatusBadge status={b.status} /></td>
                  <td className="px-6 py-3.5 font-black text-gray-900">{b.total_amount ? `$${b.total_amount}` : '—'}</td>
                  <td className="px-6 py-3.5 text-gray-400 text-xs">{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {!bookings?.length && (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-gray-300 text-sm">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    pending:    { bg: '#FEF9C3', text: '#854D0E' },
    assigned:   { bg: '#DBEAFE', text: '#1D4ED8' },
    in_transit: { bg: '#EDE9FE', text: '#5B21B6' },
    completed:  { bg: '#D1FAE5', text: '#065F46' },
    cancelled:  { bg: '#FEE2E2', text: '#991B1B' },
  }
  const s = map[status] ?? { bg: '#F3F4F6', text: '#374151' }
  return (
    <span className="inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold capitalize"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}
