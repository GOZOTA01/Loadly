'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'

interface PricingRule {
  id: string
  vehicle_category: string
  base_fee: number
  per_km_rate: number
  per_minute_rate: number
  loading_fee: number
  platform_fee_percent: number
  cancellation_fee: number
}

interface HelperPricing {
  id: string
  per_helper_base_fee: number
  per_helper_per_hour: number
}

export function PricingEditor({
  rules,
  helperPricing,
}: {
  rules: PricingRule[]
  helperPricing: HelperPricing | null
}) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const saveRule = async (rule: PricingRule) => {
    setSaving(rule.id)
    setMessage('')

    const { error } = await supabase
      .from('pricing_rules')
      .update({
        base_fee: rule.base_fee,
        per_km_rate: rule.per_km_rate,
        per_minute_rate: rule.per_minute_rate,
        loading_fee: rule.loading_fee,
        platform_fee_percent: rule.platform_fee_percent,
        cancellation_fee: rule.cancellation_fee,
      })
      .eq('id', rule.id)

    setSaving(null)
    if (error) { setMessage(error.message); return }
    setMessage('Pricing saved successfully')
    router.refresh()
  }

  const saveHelper = async (helper: HelperPricing) => {
    setSaving('helper')
    setMessage('')

    const { error } = await supabase
      .from('helper_pricing')
      .update({
        per_helper_base_fee: helper.per_helper_base_fee,
        per_helper_per_hour: helper.per_helper_per_hour,
      })
      .eq('id', helper.id)

    setSaving(null)
    if (error) { setMessage(error.message); return }
    setMessage('Helper pricing saved successfully')
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      {rules.map((rule) => (
        <RuleForm
          key={rule.id}
          rule={rule}
          saving={saving === rule.id}
          onSave={saveRule}
        />
      ))}

      {helperPricing && (
        <HelperForm
          helper={helperPricing}
          saving={saving === 'helper'}
          onSave={saveHelper}
        />
      )}
    </div>
  )
}

function RuleForm({
  rule,
  saving,
  onSave,
}: {
  rule: PricingRule
  saving: boolean
  onSave: (rule: PricingRule) => void
}) {
  const [form, setForm] = useState(rule)

  const set = (key: keyof PricingRule, value: string) => {
    setForm((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 capitalize">{rule.vehicle_category.replace(/_/g, ' ')}</h3>
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="Base fee ($)" value={form.base_fee} onChange={(v) => set('base_fee', v)} />
        <Field label="Per km ($)" value={form.per_km_rate} onChange={(v) => set('per_km_rate', v)} />
        <Field label="Per min ($)" value={form.per_minute_rate} onChange={(v) => set('per_minute_rate', v)} />
        <Field label="Loading fee ($)" value={form.loading_fee} onChange={(v) => set('loading_fee', v)} />
        <Field label="Platform fee (%)" value={form.platform_fee_percent} onChange={(v) => set('platform_fee_percent', v)} />
        <Field label="Cancellation ($)" value={form.cancellation_fee} onChange={(v) => set('cancellation_fee', v)} />
      </div>
    </div>
  )
}

function HelperForm({
  helper,
  saving,
  onSave,
}: {
  helper: HelperPricing
  saving: boolean
  onSave: (helper: HelperPricing) => void
}) {
  const [form, setForm] = useState(helper)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Helper Pricing</h3>
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        <Field
          label="Base fee per helper ($)"
          value={form.per_helper_base_fee}
          onChange={(v) => setForm((p) => ({ ...p, per_helper_base_fee: parseFloat(v) || 0 }))}
        />
        <Field
          label="Per hour per helper ($)"
          value={form.per_helper_per_hour}
          onChange={(v) => setForm((p) => ({ ...p, per_helper_per_hour: parseFloat(v) || 0 }))}
        />
      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#FF6B35]"
      />
    </div>
  )
}
