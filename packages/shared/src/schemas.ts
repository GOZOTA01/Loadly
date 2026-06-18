import { z } from 'zod'
import {
  VEHICLE_CATEGORY,
  GOODS_TYPE,
  BOOKING_STATUS,
  USER_ROLE,
  APPROVAL_STATUS,
} from './enums'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(7, 'Valid phone number required'),
  role: z.enum([USER_ROLE.CUSTOMER, USER_ROLE.DRIVER]),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// ─── Booking ──────────────────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  pickup_address: z.string().min(3),
  pickup_lat: z.number(),
  pickup_lng: z.number(),
  dropoff_address: z.string().min(3),
  dropoff_lat: z.number(),
  dropoff_lng: z.number(),
  goods_type: z.enum(Object.values(GOODS_TYPE) as [string, ...string[]]),
  goods_description: z.string().max(500).optional(),
  vehicle_category: z.enum(Object.values(VEHICLE_CATEGORY) as [string, ...string[]]),
  helper_count: z.number().int().min(0).max(5),
  is_immediate: z.boolean(),
  scheduled_at: z.string().datetime().optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

export const estimateSchema = createBookingSchema.omit({
  goods_description: true,
  is_immediate: true,
  scheduled_at: true,
})

export type EstimateInput = z.infer<typeof estimateSchema>

export const ratingSchema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().max(300).optional(),
})

export type RatingInput = z.infer<typeof ratingSchema>

// ─── Driver ───────────────────────────────────────────────────────────────────

export const driverProfileSchema = z.object({
  license_number: z.string().min(3),
  license_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
})

export type DriverProfileInput = z.infer<typeof driverProfileSchema>

export const vehicleSchema = z.object({
  category: z.enum(Object.values(VEHICLE_CATEGORY) as [string, ...string[]]),
  make: z.string().min(2),
  model: z.string().min(1),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  plate_number: z.string().min(3),
  color: z.string().min(2),
})

export type VehicleInput = z.infer<typeof vehicleSchema>

export const locationUpdateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>

export const jobStatusUpdateSchema = z.object({
  status: z.enum(Object.values(BOOKING_STATUS) as [string, ...string[]]),
  note: z.string().max(200).optional(),
})

export type JobStatusUpdateInput = z.infer<typeof jobStatusUpdateSchema>

// ─── Admin ────────────────────────────────────────────────────────────────────

export const approvalSchema = z.object({
  status: z.enum([APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REJECTED]),
  rejection_reason: z.string().max(300).optional(),
})

export type ApprovalInput = z.infer<typeof approvalSchema>

export const pricingRuleSchema = z.object({
  vehicle_category: z.enum(Object.values(VEHICLE_CATEGORY) as [string, ...string[]]),
  base_fee: z.number().positive(),
  per_km_rate: z.number().positive(),
  per_minute_rate: z.number().nonnegative(),
  loading_fee: z.number().nonnegative(),
  platform_fee_percent: z.number().min(0).max(50),
  cancellation_fee: z.number().nonnegative(),
})

export type PricingRuleInput = z.infer<typeof pricingRuleSchema>

export const helperPricingSchema = z.object({
  per_helper_base_fee: z.number().nonnegative(),
  per_helper_per_hour: z.number().nonnegative(),
})

export type HelperPricingInput = z.infer<typeof helperPricingSchema>
