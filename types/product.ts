export type BudgetTier = "budget" | "mid" | "premium";
export type FoldType = "one-step" | "two-step" | "compact";

export interface Stroller {
  id: string;
  name: string;
  brand: string;
  price: number;
  weightLbs: number;
  foldType: FoldType;
  apartmentFriendly: boolean;
  tallParentFriendly: boolean;
  carSeatCompatible: boolean;
  budgetTier: BudgetTier;
  bestFor: string[];
  worstFor: string[];
  topFeature: string;
  asin: string | null;
  rating: number;
  reviewCount: number;
  // Journey-aware fields
  isDoubleCapable?: boolean;      // second-child: can expand to double
  isConvertible?: boolean;        // upgrading: long-term flexibility
  isTravelFriendly?: boolean;     // travel-often: airline approved, lightweight
}

export interface FilterState {
  budget: "all" | "budget" | "mid" | "premium";
  space: "all" | "apartment" | "house";
  parentHeight: "all" | "short" | "average" | "tall";
  priority: "all" | "portability" | "value" | "carSeat";
}

export type SeatType = "infant" | "convertible" | "all-in-one";

export interface CarSeat {
  id: string;
  name: string;
  brand: string;
  price: number;
  weightLbs: number;
  seatType: SeatType;
  weightLimitLbs: number;
  vehicleFit: "compact" | "any";
  apartmentFriendly: boolean;
  tallParentFriendly: boolean;
  latchCompatible: boolean;
  budgetTier: BudgetTier;
  bestFor: string[];
  worstFor: string[];
  topFeature: string;
  asin: string | null;
  rating: number;
  reviewCount: number;
  // Journey-aware fields
  isFaaApproved?: boolean;        // travel-often: can fly with it
  isExtendedRear?: boolean;       // upgrading: extended rear-facing (safety upgrade)
  headrestAdjustable?: boolean;   // tall-parent: child grows taller
}

export interface CarSeatFilterState {
  budget: "all" | "budget" | "mid" | "premium";
  seatType: "all" | "infant" | "convertible" | "all-in-one";
  vehicleFit: "all" | "compact" | "any";
  priority: "all" | "lightweight" | "safety" | "value";
}

export type VideoQuality = "audio-only" | "720p" | "1080p" | "2K" | "4K";
export type BatteryLife = "no-battery" | "under-8hrs" | "8-12hrs" | "12hrs+";
export type Range = "short" | "medium" | "long";

export interface BabyMonitor {
  id: string;
  name: string;
  brand: string;
  price: number;
  videoQuality: VideoQuality;
  wifiRequired: boolean;
  hasAppControl: boolean;
  batteryLife: BatteryLife;
  range: Range;
  budgetTier: BudgetTier;
  bestFor: string[];
  worstFor: string[];
  topFeature: string;
  asin: string | null;
  rating: number;
  reviewCount: number;
  // Journey-aware fields
  isPortable?: boolean;           // travel-often + city-apartment: battery-powered, compact
  hasMultiRoom?: boolean;         // second-child: monitor multiple rooms
  hasSmartFeatures?: boolean;     // upgrading: app control, AI alerts, etc.
}

export interface MonitorFilterState {
  budget: "all" | "budget" | "mid" | "premium";
  connectivity: "all" | "wifi" | "non-wifi";
  videoQuality: "all" | "audio-only" | "standard" | "hd";
  priority: "all" | "safety" | "value" | "battery";
}

export type MaterialType = "solid-wood" | "engineered-wood" | "metal";
export type AssemblyDifficulty = "easy" | "moderate" | "hard";

export interface Crib {
  id: string;
  name: string;
  brand: string;
  price: number;
  convertible: boolean;
  materialType: MaterialType;
  assemblyDifficulty: AssemblyDifficulty;
  apartmentFriendly: boolean;
  budgetTier: BudgetTier;
  bestFor: string[];
  worstFor: string[];
  topFeature: string;
  asin: string | null;
  rating: number;
  reviewCount: number;
  // Journey-aware fields
  adjustableMattressHeight?: boolean; // tall-parent: easier on back when lifting baby
  isPortable?: boolean;               // travel-often: folds for travel
  isGiftable?: boolean;               // gift: popular, easy to set up, safe cert visible
}

export interface CribFilterState {
  budget: "all" | "budget" | "mid" | "premium";
  convertible: "all" | "yes" | "no";
  material: "all" | "solid-wood" | "engineered-wood" | "metal";
  priority: "all" | "value" | "top-rated" | "compact";
}

export type ChairType = "full-size" | "compact" | "booster" | "hook-on";

export interface HighChair {
  id: string;
  name: string;
  brand: string;
  price: number;
  chairType: ChairType;
  reclines: boolean;
  foldable: boolean;
  easyToClean: boolean;
  apartmentFriendly: boolean;
  budgetTier: BudgetTier;
  bestFor: string[];
  worstFor: string[];
  topFeature: string;
  asin: string | null;
  rating: number;
  reviewCount: number;
  // Journey-aware fields
  trayAdjustable?: boolean;       // tall-parent: adjustable tray height
  growsWithChild?: boolean;       // upgrading: adjustable as child grows
  isCompactFold?: boolean;        // travel-often + compact-car: folds small
}

export interface HighChairFilterState {
  budget: "all" | "budget" | "mid" | "premium";
  chairType: "all" | "full-size" | "compact" | "booster" | "hook-on";
  space: "all" | "apartment" | "house";
  priority: "all" | "easiest-clean" | "value" | "top-rated";
}

// ─── Shared journey scoring ────────────────────────────────────────────────
// Utility: compute a 0–N journey relevance boost score for any product.
// Higher = better match for this parent's specific situation.
// Used by all filter functions to secondary-sort results.
export type JourneyScore = { journeyBoost: number };