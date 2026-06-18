import { createServerClient } from '@/lib/supabase-server'
import { ApproveDriverButton } from './ApproveDriverButton'

export default async function DriversPage() {
  const supabase = await createServerClient()

  const { data: drivers } = await supabase
    .from('driver_profiles')
    .select('*, users(full_name, email, phone)')
    .order('approval_status', { ascending: true }) // pending first

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Drivers</h1>
        <p className="text-gray-500 text-sm mt-1">Review and approve driver applications</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 font-medium border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3">Driver</th>
              <th className="px-6 py-3">License</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(drivers ?? []).map((driver: any) => (
              <tr key={driver.user_id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">{driver.users?.full_name}</p>
                  <p className="text-gray-500 text-xs">{driver.users?.email}</p>
                  <p className="text-gray-500 text-xs">{driver.users?.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-mono text-xs">{driver.license_number}</p>
                  <p className="text-gray-500 text-xs">Exp: {driver.license_expiry}</p>
                </td>
                <td className="px-6 py-4">
                  <ApprovalBadge status={driver.approval_status} />
                </td>
                <td className="px-6 py-4">
                  {driver.approval_status === 'pending' && (
                    <ApproveDriverButton driverId={driver.user_id} />
                  )}
                </td>
              </tr>
            ))}
            {!drivers?.length && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No drivers yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ApprovalBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status] ?? ''}`}>
      {status}
    </span>
  )
}
