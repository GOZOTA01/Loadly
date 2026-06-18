import type { PricingRule, HelperPricing, PriceEstimate } from './types'

interface EstimateParams {
  rule: PricingRule
  helperPricing: HelperPricing
  distanceKm: number
  durationMin: number
  helperCount: number
}

export function calculateEstimate({
  rule,
  helperPricing,
  distanceKm,
  durationMin,
  helperCount,
}: EstimateParams): PriceEstimate {
  const base_fee = rule.base_fee
  const distance_fee = distanceKm * rule.per_km_rate
  const time_fee = durationMin * rule.per_minute_rate
  const helper_fee = helperCount * helperPricing.per_helper_base_fee
  const loading_fee = helperCount > 0 ? rule.loading_fee : 0

  const subtotal = base_fee + distance_fee + time_fee + helper_fee + loading_fee
  const platform_fee = +(subtotal * (rule.platform_fee_percent / 100)).toFixed(2)
  const total = +(subtotal + platform_fee).toFixed(2)

  return {
    base_fee,
    distance_fee: +distance_fee.toFixed(2),
    time_fee: +time_fee.toFixed(2),
    helper_fee: +helper_fee.toFixed(2),
    loading_fee: +loading_fee.toFixed(2),
    subtotal: +subtotal.toFixed(2),
    platform_fee,
    total,
    currency: 'USD',
    distance_km: distanceKm,
    duration_min: durationMin,
  }
}
