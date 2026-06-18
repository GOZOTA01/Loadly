import { createServerClient } from '@/lib/supabase-server'

export default async function PricingPage() {
  const supabase = await createServerClient()

  const [{ data: rules }, { data: helperPricing }] = await Promise.all([
    supabase.from('pricing_rules').select('*').eq('is_active', true).order('vehicle_category'),
    supabase.from('helper_pricing').select('*').order('effective_from', { ascending: false }).limit(1),
  ])

  const helper = helperPricing?.[0]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Pricing</h1>
        <p className="text-gray-500 text-sm mt-1">Current active pricing rules</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Vehicle Pricing</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 font-medium border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3">Vehicle</th>
              <th className="px-6 py-3">Base Fee</th>
              <th className="px-6 py-3">Per km</th>
              <th className="px-6 py-3">Per min</th>
              <th className="px-6 py-3">Loading Fee</th>
              <th className="px-6 py-3">Platform %</th>
              <th className="px-6 py-3">Cancellation</th>
            </tr>
          </thead>
          <tbody>
            {(rules ?? []).map((r: any) => (
              <tr key={r.id} className="border-b border-gray-50">
                <td className="px-6 py-3 font-semibold capitalize">{r.vehicle_category.replace(/_/g, ' ')}</td>
                <td className="px-6 py-3">${r.base_fee}</td>
                <td className="px-6 py-3">${r.per_km_rate}</td>
                <td className="px-6 py-3">${r.per_minute_rate}</td>
                <td className="px-6 py-3">${r.loading_fee}</td>
                <td className="px-6 py-3">{r.platform_fee_percent}%</td>
                <td className="px-6 py-3">${r.cancellation_fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {helper && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Helper Pricing</h2>
          <div className="flex gap-8">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Base fee per helper</p>
              <p className="text-2xl font-black text-gray-900 mt-1">${helper.per_helper_base_fee}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Per hour per helper</p>
              <p className="text-2xl font-black text-gray-900 mt-1">${helper.per_helper_per_hour}</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">To update pricing, edit the pricing_rules table in your Supabase dashboard and insert a new row — pricing changes take effect immediately.</p>
    </div>
  )
}
