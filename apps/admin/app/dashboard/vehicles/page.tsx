import { createServerClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/Header'
import { ApproveVehicleButton } from './ApproveVehicleButton'

export default async function VehiclesPage() {
  const supabase = await createServerClient()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*, users(full_name)')
    .order('approval_status')

  return (
    <div>
      <Header title="Vehicles" subtitle="Review and approve vehicle registrations" />
      <div className="p-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 font-medium border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3">Driver</th>
              <th className="px-6 py-3">Vehicle</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Plate</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(vehicles ?? []).map((v: any) => (
              <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">{v.users?.full_name}</td>
                <td className="px-6 py-4 text-gray-700">{v.year} {v.make} {v.model} <span className="text-gray-400">· {v.color}</span></td>
                <td className="px-6 py-4 capitalize text-gray-600">{v.category?.replace(/_/g, ' ')}</td>
                <td className="px-6 py-4 font-mono text-gray-800">{v.plate_number}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${v.approval_status === 'approved' ? 'bg-green-100 text-green-800' : v.approval_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {v.approval_status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {v.approval_status === 'pending' && <ApproveVehicleButton vehicleId={v.id} />}
                </td>
              </tr>
            ))}
            {!vehicles?.length && (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-300 text-sm">No vehicles registered yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  )
}
