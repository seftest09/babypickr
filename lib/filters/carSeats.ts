import type { CarSeat, CarSeatFilterState } from "@/types/product";
import type { JourneyTypeId, SituationId } from "@/lib/journeyStorage";
import { carSeatJourneyBoost } from "@/lib/journeyStorage";
import { compareRatedByTrustDesc } from "@/lib/trustScore";

function carSeatBudgetTier(price: number): "budget" | "mid" | "premium" {
  if (price < 200) return "budget";
  if (price <= 450) return "mid";
  return "premium";
}

export interface CarSeatFilterOptions {
  journeyType?: JourneyTypeId;
  situations?: SituationId[];
}

export function filterCarSeats(
  seats: readonly CarSeat[],
  filters: CarSeatFilterState,
  journey?: CarSeatFilterOptions,
): CarSeat[] {
  const journeyType = journey?.journeyType;
  const situations = journey?.situations ?? [];

  let filtered = [...seats];

  // ── HARD FILTERS ─────────────────────────────────────────────────────────

  if (filters.budget !== "all") {
    filtered = filtered.filter((s) => carSeatBudgetTier(s.price) === filters.budget);
  }

  // seatType: set by journeyType (upgrading → convertible, second-child → convertible/all-in-one)
  if (filters.seatType !== "all") {
    if (journeyType === "second-child" && filters.seatType === "convertible") {
      // For second-child, accept both convertible AND all-in-one
      filtered = filtered.filter(
        (s) => s.seatType === "convertible" || s.seatType === "all-in-one",
      );
    } else {
      filtered = filtered.filter((s) => s.seatType === filters.seatType);
    }
  }

  // compact-car: hard filter — only seats proven to fit compact vehicles
  if (filters.vehicleFit === "compact") {
    filtered = filtered.filter((s) => s.vehicleFit === "compact");
  }

  // ── SORTING ───────────────────────────────────────────────────────────────

  filtered.sort((a, b) => {
    // Primary sort
    if (filters.priority === "value") {
      const priceDiff = a.price - b.price;
      if (priceDiff !== 0) return priceDiff;
    } else if (filters.priority === "lightweight") {
      const weightDiff = a.weightLbs - b.weightLbs;
      if (weightDiff !== 0) return weightDiff;
    } else if (filters.priority === "safety") {
      // Safety: prefer extended rear-facing + higher weight limits
      const safetyA = (a.isExtendedRear ? 2 : 0) + (a.weightLimitLbs > 65 ? 1 : 0);
      const safetyB = (b.isExtendedRear ? 2 : 0) + (b.weightLimitLbs > 65 ? 1 : 0);
      if (safetyB !== safetyA) return safetyB - safetyA;
    }

    // Secondary: journey boost
    if (journeyType) {
      const boostA = carSeatJourneyBoost(a, journeyType, situations);
      const boostB = carSeatJourneyBoost(b, journeyType, situations);
      if (boostB !== boostA) return boostB - boostA;
    }

    return compareRatedByTrustDesc(a, b);
  });

  return filtered;
}