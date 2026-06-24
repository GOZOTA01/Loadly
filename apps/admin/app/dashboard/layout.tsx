import { Sidebar } from '@/components/layout/Sidebar'
import { requireAdmin } from '@/lib/require-admin'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
