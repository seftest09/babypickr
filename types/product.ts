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