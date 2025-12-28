export interface Booking {
  id: number
  roomTypeId: number
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  status: 'confirmed' | 'cancelled' | 'completed'
  cancellationPolicySnapshot?: CancellationPolicySnapshot
  guestName: string
  guestEmail: string
  createdAt: string
  cancelledAt?: string
}

export interface CancellationPolicySnapshot {
  id: number
  name: string
  code: string
  description: string
  rules: CancellationPolicyRule[]
}

export interface CancellationPolicyRule {
  daysBefore: number
  penaltyPercentage: number
  description: string
}

export interface CancellationResult {
  canCancel: boolean
  refundAmount: number
  penaltyAmount: number
  daysBeforeCheckin: number
  appliedRuleDescription: string
}

export interface RoomType {
  id: number
  name: string
  basePrice: number
  cancellationPolicyId?: number
}
