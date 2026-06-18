export const USER_ROLE = {
  CUSTOMER: 'customer',
  DRIVER: 'driver',
  ADMIN: 'admin',
} as const
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const VEHICLE_CATEGORY = {
  PICKUP_VAN: 'pickup_van',
  TRUCK_1T: 'truck_1t',
  TRUCK_3T: 'truck_3t',
  TRUCK_5T: 'truck_5t',
  LORRY: 'lorry',
} as const
export type VehicleCategory = (typeof VEHICLE_CATEGORY)[keyof typeof VEHICLE_CATEGORY]

export const VEHICLE_CATEGORY_LABEL: Record<VehicleCategory, string> = {
  pickup_van: 'Pickup / Van',
  truck_1t: '1-Ton Truck',
  truck_3t: '3-Ton Truck',
  truck_5t: '5-Ton Truck',
  lorry: 'Lorry / Heavy',
}

export const VEHICLE_CATEGORY_DESCRIPTION: Record<VehicleCategory, string> = {
  pickup_van: 'Boxes, small furniture, small appliances',
  truck_1t: 'Tiles, small building materials, small moves',
  truck_3t: 'Bricks, furniture, medium loads',
  truck_5t: 'Large construction materials, big moves',
  lorry: 'Large commercial loads',
}

export const VEHICLE_CATEGORY_MAX_KG: Record<VehicleCategory, number> = {
  pickup_van: 800,
  truck_1t: 1000,
  truck_3t: 3000,
  truck_5t: 5000,
  lorry: 15000,
}

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  DRIVER_EN_ROUTE: 'driver_en_route',
  ARRIVED_PICKUP: 'arrived_pickup',
  LOADING: 'loading',
  IN_TRANSIT: 'in_transit',
  ARRIVED_DROPOFF: 'arrived_dropoff',
  UNLOADING: 'unloading',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS]

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Finding driver',
  assigned: 'Driver assigned',
  driver_en_route: 'Driver on the way',
  arrived_pickup: 'Driver arrived',
  loading: 'Loading goods',
  in_transit: 'In transit',
  arrived_dropoff: 'Arrived at destination',
  unloading: 'Unloading goods',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

/** Statuses the driver can transition to, in order */
export const DRIVER_STATUS_SEQUENCE: BookingStatus[] = [
  'driver_en_route',
  'arrived_pickup',
  'loading',
  'in_transit',
  'arrived_dropoff',
  'unloading',
  'delivered',
]

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const
export type ApprovalStatus = (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS]

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export const GOODS_TYPE = {
  FURNITURE: 'furniture',
  APPLIANCES: 'appliances',
  BUILDING_MATERIALS: 'building_materials',
  BOXES_GENERAL: 'boxes_general',
  OFFICE_EQUIPMENT: 'office_equipment',
  TILES_FLOORING: 'tiles_flooring',
  BRICKS_BLOCKS: 'bricks_blocks',
  OTHER: 'other',
} as const
export type GoodsType = (typeof GOODS_TYPE)[keyof typeof GOODS_TYPE]

export const GOODS_TYPE_LABEL: Record<GoodsType, string> = {
  furniture: 'Furniture',
  appliances: 'Appliances',
  building_materials: 'Building Materials',
  boxes_general: 'Boxes / General',
  office_equipment: 'Office Equipment',
  tiles_flooring: 'Tiles / Flooring',
  bricks_blocks: 'Bricks / Blocks',
  other: 'Other',
}
