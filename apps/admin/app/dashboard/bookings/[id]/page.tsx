import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { requireAdmin } from '@/lib/require-admin'
import { ArrowLeft, MapPin, Package, User, Truck, CreditCard } from 'lucide-react'
import { BOOKING_STATUS_LABEL } from '@loadly/shared'
import { AssignDriverForm } from './AssignDriverForm'
import { BookingActions } from './BookingActions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (!booking) notFound()

  const [
    { data: customer },
    { data: driver },
    { data: vehicle },
    { data: history },
    { data: photos },
  ] = await Promise.all([
    supabase.from('users').select('full_name, email, phone').eq('id', booking.customer_id).single(),
    booking.driver_id
      ? supabase.from('users').select('full_name, email, phone').eq('id', booking.driver_id).single()
      : Promise.resolve({ data: null }),
    booking.vehicle_id
      ? supabase.from('vehicles').select('make, model, year, plate_number, category').eq('id', booking.vehicle_id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from('booking_status_history')
      .select('status, note, created_at, changed_by')
      .eq('booking_id', id)
      .order('created_at', { ascending: true }),
    supabase.from('booking_photos').select('url, type, created_at').eq('booking_id', id),
  ])

  const { data: approvedVehicles } = await supabase
    .from('vehicles')
    .select('id, make, model, plate_number, driver_id, users(full_name)')
    .eq('approval_status', 'approved')
    .eq('is_active', true)

  const driverOptions = (approvedVehicles ?? []).map((v: any) => ({
    user_id: v.driver_id,
    full_name: v.users?.full_name ?? 'Driver',
    vehicle_id: v.id,
    vehicle_label: `${v.make} ${v.model} (${v.plate_number})`,
  }))

  const canAssign = !['completed', 'cancelled'].includes(booking.status)
  const canCancel = !['completed', 'cancelled'].includes(booking.status)

  return (
    <div>
      <Header title="Booking Detail" subtitle={`#${id.slice(0, 8).toUpperCase()}`} />

      <div className="p-8 space-y-6 max-w-5xl">
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#FF6B35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to bookings
        </Link>

        {/* Status + amount banner */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <StatusBadge status={booking.status} />
            <p className="text-gray-400 text-xs mt-2">
              Created {new Date(booking.created_at).toLocaleString()}
              {booking.completed_at && ` · Completed ${new Date(booking.completed_at).toLocaleString()}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-gray-900">
              {booking.total_amount ? `$${Number(booking.total_amount).toFixed(2)}` : '—'}
            </p>
            <p className="text-xs text-gray-400 capitalize mt-1">{booking.payment_status} payment</p>
          </div>
        </div>

        {/* Admin actions */}
        {(canAssign || canCancel) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {canAssign && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h2 className="font-bold text-gray-900">Assign Driver</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Manually assign an approved driver to this booking</p>
                </div>
                <div className="p-6">
                  <AssignDriverForm
                    bookingId={id}
                    drivers={driverOptions}
                    currentDriverId={booking.driver_id}
                  />
                </div>
              </div>
            )}

            {canCancel && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h2 className="font-bold text-gray-900">Booking Actions</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Cancel or mark payment as refunded</p>
                </div>
                <div className="p-6">
                  <BookingActions
                    bookingId={id}
                    status={booking.status}
                    paymentStatus={booking.payment_status}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Route */}
          <Card title="Route" icon={<MapPin className="w-4 h-4" />}>
            <RouteRow label="Pickup" address={booking.pickup_address} dot="bg-[#FF6B35]" />
            <div className="ml-2 h-6 w-0.5 bg-gray-200 my-1" />
            <RouteRow label="Dropoff" address={booking.dropoff_address} dot="bg-green-500" />
            {booking.distance_km && (
              <p className="text-xs text-gray-400 mt-4">
                {booking.distance_km} km · ~{booking.estimated_duration_min} min
              </p>
            )}
          </Card>

          {/* Load details */}
          <Card title="Load" icon={<Package className="w-4 h-4" />}>
            <InfoRow label="Goods type" value={booking.goods_type.replace(/_/g, ' ')} />
            <InfoRow label="Vehicle" value={booking.vehicle_category.replace(/_/g, ' ')} />
            <InfoRow label="Helpers" value={booking.helper_count > 0 ? `${booking.helper_count} requested` : 'None'} />
            {booking.goods_description && (
              <InfoRow label="Notes" value={booking.goods_description} />
            )}
            <InfoRow
              label="Schedule"
              value={booking.is_immediate ? 'Immediate' : new Date(booking.scheduled_at!).toLocaleString()}
            />
          </Card>

          {/* Customer */}
          <Card title="Customer" icon={<User className="w-4 h-4" />}>
            <InfoRow label="Name" value={customer?.full_name ?? '—'} />
            <InfoRow label="Email" value={customer?.email ?? '—'} />
            <InfoRow label="Phone" value={customer?.phone ?? '—'} />
          </Card>

          {/* Driver */}
          <Card title="Driver" icon={<Truck className="w-4 h-4" />}>
            {driver ? (
              <>
                <InfoRow label="Name" value={driver.full_name} />
                <InfoRow label="Email" value={driver.email} />
                <InfoRow label="Phone" value={driver.phone ?? '—'} />
                {vehicle && (
                  <InfoRow
                    label="Vehicle"
                    value={`${vehicle.year ?? ''} ${vehicle.make} ${vehicle.model} · ${vehicle.plate_number}`.trim()}
                  />
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400 py-2">No driver assigned yet</p>
            )}
          </Card>
        </div>

        {/* Pricing breakdown */}
        <Card title="Pricing" icon={<CreditCard className="w-4 h-4" />}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <PriceCell label="Subtotal" value={booking.subtotal} />
            <PriceCell label="Platform fee" value={booking.platform_fee} />
            <PriceCell label="Total" value={booking.total_amount} highlight />
            <PriceCell label="Currency" value={booking.currency} isText />
          </div>
        </Card>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">Status Timeline</h2>
          </div>
          <div className="p-6">
            {(history ?? []).length === 0 ? (
              <p className="text-sm text-gray-400">No status updates yet</p>
            ) : (
              <ol className="space-y-4">
                {(history ?? []).map((entry: any, i: number) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#FF6B35] shrink-0 mt-1" />
                      {i < (history!.length - 1) && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {BOOKING_STATUS_LABEL[entry.status as keyof typeof BOOKING_STATUS_LABEL] ?? entry.status}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                      {entry.note && <p className="text-xs text-gray-500 mt-1">{entry.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Photos */}
        {(photos ?? []).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Photos</h2>
            </div>
            <div className="p-6 flex flex-wrap gap-4">
              {(photos ?? []).map((photo: any) => (
                <a
                  key={photo.url}
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.type}
                    className="w-32 h-32 object-cover rounded-xl border border-gray-100 hover:opacity-90 transition-opacity"
                  />
                  <p className="text-xs text-gray-400 mt-1 capitalize text-center">{photo.type.replace(/_/g, ' ')}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
        <span className="text-[#FF6B35]">{icon}</span>
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-6 space-y-3">{children}</div>
    </div>
  )
}

function RouteRow({ label, address, dot }: { label: string; address: string; dot: string }) {
  return (
    <div className="flex gap-3">
      <div className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0 mt-1.5`} />
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{address}</p>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="font-medium text-gray-800 text-right capitalize">{value}</span>
    </div>
  )
}

function PriceCell({ label, value, highlight, isText }: { label: string; value: any; highlight?: boolean; isText?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-[#FFF0EB]' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className={`text-lg font-black mt-1 ${highlight ? 'text-[#FF6B35]' : 'text-gray-900'}`}>
        {isText ? value : value != null ? `$${Number(value).toFixed(2)}` : '—'}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    pending:       { bg: '#FEF9C3', text: '#854D0E' },
    assigned:      { bg: '#DBEAFE', text: '#1D4ED8' },
    driver_en_route: { bg: '#EDE9FE', text: '#6D28D9' },
    in_transit:    { bg: '#EDE9FE', text: '#5B21B6' },
    completed:     { bg: '#D1FAE5', text: '#065F46' },
    cancelled:     { bg: '#FEE2E2', text: '#991B1B' },
  }
  const s = map[status] ?? { bg: '#F3F4F6', text: '#374151' }
  return (
    <span className="inline-block px-3 py-1 rounded-xl text-sm font-bold capitalize"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
