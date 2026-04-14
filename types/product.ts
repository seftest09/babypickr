export type BudgetTier = "budget" | "mid" | "premium"
export type FoldType = "one-step" | "two-step" | "compact"

export interface Stroller {
  id: string
  name: string
  brand: string
  price: number
  weightLbs: number
  foldType: FoldType
  apartmentFriendly: boolean
  tallParentFriendly: boolean
  carSeatCompatible: boolean
  budgetTier: BudgetTier
  bestFor: string[]
  worstFor: string[]
  topFeature: string
  asin: string | null
  rating: number
  reviewCount: number
}

export interface FilterState {
  budget: "all" | "budget" | "mid" | "premium"
  space: "all" | "apartment" | "house"
  parentHeight: "all" | "short" | "average" | "tall"
  priority: "all" | "portability" | "value" | "carSeat"
}

export type SeatType = "infant" | "convertible" | "all-in-one"

export interface CarSeat {
  id: string
  name: string
  brand: string
  price: number
  weightLbs: number
  seatType: SeatType
  weightLimitLbs: number
  vehicleFit: "compact" | "any"
  apartmentFriendly: boolean
  tallParentFriendly: boolean
  latchCompatible: boolean
  budgetTier: BudgetTier
  bestFor: string[]
  worstFor: string[]
  topFeature: string
  asin: string | null
  rating: number
  reviewCount: number
}

export interface CarSeatFilterState {
  budget: "all" | "budget" | "mid" | "premium"
  seatType: "all" | "infant" | "convertible" | "all-in-one"
  vehicleFit: "all" | "compact" | "any"
  priority: "all" | "lightweight" | "safety" | "value"
}