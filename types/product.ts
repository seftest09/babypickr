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

export type VideoQuality = "audio-only" | "720p" | "1080p" | "2K" | "4K"
export type BatteryLife = "no-battery" | "under-8hrs" | "8-12hrs" | "12hrs+"
export type Range = "short" | "medium" | "long"

export interface BabyMonitor {
  id: string
  name: string
  brand: string
  price: number
  videoQuality: VideoQuality
  wifiRequired: boolean
  hasAppControl: boolean
  batteryLife: BatteryLife
  range: Range
  budgetTier: BudgetTier
  bestFor: string[]
  worstFor: string[]
  topFeature: string
  asin: string | null
  rating: number
  reviewCount: number
}

export interface MonitorFilterState {
  budget: "all" | "budget" | "mid" | "premium"
  connectivity: "all" | "wifi" | "non-wifi"
  videoQuality: "all" | "audio-only" | "standard" | "hd"
  priority: "all" | "safety" | "value" | "battery"
}

export type MaterialType = "solid-wood" | "engineered-wood" | "metal"
export type AssemblyDifficulty = "easy" | "moderate" | "hard"
export type ChairType = "full-size" | "compact" | "booster" | "hook-on"

export interface Crib {
  id: string
  name: string
  brand: string
  price: number
  convertible: boolean
  materialType: MaterialType
  assemblyDifficulty: AssemblyDifficulty
  apartmentFriendly: boolean
  budgetTier: BudgetTier
  bestFor: string[]
  worstFor: string[]
  topFeature: string
  asin: string | null
  rating: number
  reviewCount: number
}

export interface CribFilterState {
  budget: "all" | "budget" | "mid" | "premium"
  convertible: "all" | "yes" | "no"
  material: "all" | "solid-wood" | "engineered-wood" | "metal"
  priority: "all" | "value" | "top-rated" | "compact"
}

export interface HighChair {
  id: string
  name: string
  brand: string
  price: number
  chairType: ChairType
  reclines: boolean
  foldable: boolean
  easyToClean: boolean
  apartmentFriendly: boolean
  budgetTier: BudgetTier
  bestFor: string[]
  worstFor: string[]
  topFeature: string
  asin: string | null
  rating: number
  reviewCount: number
}

export interface HighChairFilterState {
  budget: "all" | "budget" | "mid" | "premium"
  chairType: "all" | "full-size" | "compact" | "booster" | "hook-on"
  space: "all" | "apartment" | "house"
  priority: "all" | "easiest-clean" | "value" | "top-rated"
}