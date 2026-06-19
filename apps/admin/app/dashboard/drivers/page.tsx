import { createServerClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/Header'
import { ApproveDriverButton } from './ApproveDriverButton'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

export default async function DriversPage() {
  const supabase = await createServerClient()

  const { data: drivers } = await supabase
    .from('driver_profiles')
    .select('*, users(full_name, email, phone)')
    .order('approval_status', { ascending: true })

  const pending = drivers?.filter((d: any) => d.approval_status === 'pending').length ?? 0
  const approved = drivers?.filter((d: any) => d.approval_status === 'approved').length ?? 0
  const rejected = drivers?.filter((d: any) => d.approval_status === 'rejected').length ?? 0

  return (
    <div>
      <Header title="Drivers" subtitle="Review and approve driver applications" />

      <div className="p-8 space-y-6">

        {/* Summary pills */}
        <div className="flex gap-3 flex-wrap">
          <StatPill label="Approved" value={approved} color="#10B981" bg="#ECFDF5" icon={<CheckCircle2 className="w-4 h-4" />} />
          <StatPill label="Pending" value={pending} color="#F59E0B" bg="#FFFBEB" icon={<Clock className="w-4 h-4" />} />
          <StatPill label="Rejected" value={rejected} color="#EF4444" bg="#FEF2F2" icon={<XCircle className="w-4 h-4" />} />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">License</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Online</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(drivers ?? []).map((driver: any) => (
                <tr key={driver.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0"
                        style={{ backgroundColor: '#3A4A54' }}
                      >
                        {driver.users?.full_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{driver.users?.full_name}</p>
                        <p className="text-xs text-gray-400">{driver.users?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg inline-block">{driver.license_number}</p>
                    <p className="text-xs text-gray-400 mt-1">Exp: {driver.license_expiry}</p>
                  </td>
                  <td className="px-6 py-4">
                    <ApprovalBadge status={driver.approval_status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${driver.is_online ? 'bg-green-400' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-500">{driver.is_online ? 'Online' : 'Offline'}</span>
                    </div>
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
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-300 text-sm">
                    No drivers registered yet
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

function ApprovalBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    pending:  { bg: '#FEF9C3', text: '#854D0E' },
    approved: { bg: '#D1FAE5', text: '#065F46' },
    rejected: { bg: '#FEE2E2', text: '#991B1B' },
  }
  const s = map[status] ?? { bg: '#F3F4F6', text: '#374151' }
  return (
    <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold capitalize"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {status}
    </span>
  )
}

function StatPill({ label, value, color, bg, icon }: any) {
  return (
    <div className="flex items-center gap-2.5 bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg, color }}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
