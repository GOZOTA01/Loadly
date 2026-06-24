import { Header } from '@/components/layout/Header'
import { requireAdmin } from '@/lib/require-admin'
import { PricingEditor } from './PricingEditor'

export default async function PricingPage() {
  const { supabase } = await requireAdmin()

  const [{ data: rules }, { data: helperPricing }] = await Promise.all([
    supabase.from('pricing_rules').select('*').eq('is_active', true).order('vehicle_category'),
    supabase.from('helper_pricing').select('*').order('effective_from', { ascending: false }).limit(1),
  ])

  const helper = helperPricing?.[0] ?? null

  return (
    <div>
      <Header title="Pricing" subtitle="Edit vehicle and helper rates" />

      <div className="p-8 max-w-4xl">
        <PricingEditor rules={rules ?? []} helperPricing={helper} />
      </div>
    </div>
  )
}
