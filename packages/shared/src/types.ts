import type {
  UserRole,
  VehicleCategory,
  BookingStatus,
  ApprovalStatus,
  PaymentStatus,
  GoodsType,
} from './enums'

export interface User {
  id: string
  email: string
  phone: string | null
  full_name: string
  role: UserRole
  avatar_url: string | null
  status: 'active' | 'suspended'
  created_at: string
}

export interface DriverProfile {
  user_id: string
  license_number: string
  license_expiry: string
  license_doc_url: string | null
  approval_status: ApprovalStatus
  rejection_reason: string | null
  is_online: boolean
  current_lat: number | null
  current_lng: number | null
  last_location_at: string | null
}

export interface Vehicle {
  id: string
  driver_id: string
  category: VehicleCategory
  make: string
  model: string
  year: number
  plate_number: string
  max_weight_kg: number
  color: string
  insurance_doc_url: string | null
  registration_doc_url: string | null
  photos: string[]
  approval_status: ApprovalStatus
  is_active: boolean
  created_at: string
}

export interface PricingRule {
  id: string
  vehicle_category: VehicleCategory
  base_fee: number
  per_km_rate: number
  per_minute_rate: number
  loading_fee: number
  platform_fee_percent: number
  cancellation_fee: number
  effective_from: string
  is_active: boolean
}

export interface HelperPricing {
  id: string
  per_helper_base_fee: number
  per_helper_per_hour: number
  effective_from: string
}

export interface Booking {
  id: string
  customer_id: string
  driver_id: string | null
  vehicle_id: string | null
  status: BookingStatus
  goods_type: GoodsType
  goods_description: string | null
  helper_count: number
  pickup_address: string
  pickup_lat: number
  pickup_lng: number
  dropoff_address: string
  dropoff_lat: number
  dropoff_lng: number
  scheduled_at: string | null
  is_immediate: boolean
  distance_km: number | null
  estimated_duration_min: number | null
  subtotal: number | null
  platform_fee: number | null
  total_amount: number | null
  currency: string
  payment_status: PaymentStatus
  stripe_payment_intent_id: string | null
  created_at: string
  completed_at: string | null
}

export interface BookingPhoto {
  id: string
  booking_id: string
  url: string
  type: 'load' | 'proof_of_delivery'
  created_at: string
}

export interface BookingStatusHistory {
  id: string
  booking_id: string
  status: BookingStatus
  changed_by: string
  note: string | null
  created_at: string
}

export interface Rating {
  id: string
  booking_id: string
  customer_id: string
  driver_id: string
  score: number
  comment: string | null
  created_at: string
}

export interface DriverEarning {
  id: string
  driver_id: string
  booking_id: string
  gross_amount: number
  platform_fee: number
  net_amount: number
  payout_status: 'pending' | 'paid'
  created_at: string
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: { message: string; code?: string }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Pricing estimate ─────────────────────────────────────────────────────────

export interface PriceEstimate {
  base_fee: number
  distance_fee: number
  time_fee: number
  helper_fee: number
  loading_fee: number
  subtotal: number
  platform_fee: number
  total: number
  currency: string
  distance_km: number
  duration_min: number
}
