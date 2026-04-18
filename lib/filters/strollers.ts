import type { FilterState, Stroller } from "@/types/product";
import type { JourneyTypeId, SituationId } from "@/lib/journeyStorage";
import { strollerJourneyBoost } from "@/lib/journeyStorage";
import { compareRatedByTrustDesc } from "@/lib/trustScore";

function strollerBudgetTier(price: number): "budget" | "mid" | "premium" {
  if (price < 300) return "budget";
  if (price <= 700) return "mid";
  return "premium";
}

export interface StrollerFilterOptions {
  journeyType?: JourneyTypeId;
  situations?: SituationId[];
}

export function filterStrollers(
  strollers: readonly Stroller[],
  filters: FilterState,
  journey?: StrollerFilterOptions,
): Stroller[] {
  const journeyType = journey?.journeyType;
  const situations = journey?.situations ?? [];

  let filtered = [...strollers];

  // ── HARD FILTERS ─────────────────────────────────────────────────────────

  if (filters.budget !== "all") {
    filtered = filtered.filter((s) => strollerBudgetTier(s.price) === filters.budget);
  }

  if (filters.space === "apartment") {
    filtered = filtered.filter((s) => s.apartmentFriendly === true);
  } else if (filters.space === "house") {
    filtered = filtered.filter((s) => s.apartmentFriendly === false);
  }

  if (filters.parentHeight === "tall") {
    filtered = filtered.filter((s) => s.tallParentFriendly === true);
  } else if (filters.parentHeight === "short" || filters.parentHeight === "average") {
    filtered = filtered.filter((s) => !s.tallParentFriendly);
  }

  if (filters.priority === "carSeat") {
    filtered = filtered.filter((s) => s.carSeatCompatible);
  }

  // ── SORTING ───────────────────────────────────────────────────────────────

  filtered.sort((a, b) => {
    if (filters.priority === "value") {
      const priceDiff = a.price - b.price;
      if (priceDiff !== 0) return priceDiff;
    } else if (filters.priority === "portability") {
      const weightDiff = a.weightLbs - b.weightLbs;
      if (weightDiff !== 0) return weightDiff;
    }

    if (journeyType) {
      const boostA = strollerJourneyBoost(a, journeyType, situations);
      const boostB = strollerJourneyBoost(b, journeyType, situations);
      if (boostB !== boostA) return boostB - boostA;
    }

    return compareRatedByTrustDesc(a, b);
  });

  return filtered;
}
