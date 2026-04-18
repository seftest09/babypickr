import type { Crib, CribFilterState } from "@/types/product";
import type { JourneyTypeId, SituationId } from "@/lib/journeyStorage";
import { cribJourneyBoost } from "@/lib/journeyStorage";
import { compareRatedByTrustDesc } from "@/lib/trustScore";

function cribBudgetTier(price: number): "budget" | "mid" | "premium" {
  if (price < 250) return "budget";
  if (price <= 600) return "mid";
  return "premium";
}

export interface CribFilterOptions {
  journeyType?: JourneyTypeId;
  situations?: SituationId[];
}

export function filterCribs(
  cribs: readonly Crib[],
  filters: CribFilterState,
  journey?: CribFilterOptions,
): Crib[] {
  const journeyType = journey?.journeyType;
  const situations = journey?.situations ?? [];

  let filtered = [...cribs];

  // ── HARD FILTERS ─────────────────────────────────────────────────────────

  if (filters.budget !== "all") {
    filtered = filtered.filter((c) => cribBudgetTier(c.price) === filters.budget);
  }

  // convertible: set by journeyType === "upgrading" OR manual filter
  if (filters.convertible === "yes") {
    filtered = filtered.filter((c) => c.convertible === true);
  } else if (filters.convertible === "no") {
    filtered = filtered.filter((c) => c.convertible === false);
  }

  if (filters.material !== "all") {
    filtered = filtered.filter((c) => c.materialType === filters.material);
  }

  // city-apartment: hard filter to compact/apartment-friendly cribs
  if (filters.priority === "compact") {
    filtered = filtered.filter((c) => c.apartmentFriendly === true);
  }

  // tall-parent HARD FILTER: adjustable mattress height
  // Applied when tall-parent situation is present (passed via journey param)
  if (situations.includes("tall-parent")) {
    // Hard filter: only show cribs with adjustable mattress height
    const tallFriendly = filtered.filter((c) => c.adjustableMattressHeight === true);
    // Only apply if it doesn't eliminate everything (graceful degradation)
    if (tallFriendly.length > 0) {
      filtered = tallFriendly;
    }
  }

  // ── SORTING ───────────────────────────────────────────────────────────────

  filtered.sort((a, b) => {
    // Primary sort
    if (filters.priority === "value") {
      const priceDiff = a.price - b.price;
      if (priceDiff !== 0) return priceDiff;
    } else if (filters.priority === "top-rated") {
      return compareRatedByTrustDesc(a, b);
    }
    // "compact" was already a hard filter above, then falls through to boost/trust

    // Secondary: journey boost
    if (journeyType) {
      const boostA = cribJourneyBoost(a, journeyType, situations);
      const boostB = cribJourneyBoost(b, journeyType, situations);
      if (boostB !== boostA) return boostB - boostA;
    }

    return compareRatedByTrustDesc(a, b);
  });

  return filtered;
}