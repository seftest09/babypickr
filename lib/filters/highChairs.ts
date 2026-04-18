import type { HighChair, HighChairFilterState } from "@/types/product";
import type { JourneyTypeId, SituationId } from "@/lib/journeyStorage";
import { highChairJourneyBoost } from "@/lib/journeyStorage";
import { compareRatedByTrustDesc } from "@/lib/trustScore";

function highChairBudgetTier(price: number): "budget" | "mid" | "premium" {
  if (price < 100) return "budget";
  if (price <= 300) return "mid";
  return "premium";
}

export interface HighChairFilterOptions {
  journeyType?: JourneyTypeId;
  situations?: SituationId[];
}

export function filterHighChairs(
  chairs: readonly HighChair[],
  filters: HighChairFilterState,
  journey?: HighChairFilterOptions,
): HighChair[] {
  const journeyType = journey?.journeyType;
  const situations = journey?.situations ?? [];

  let filtered = [...chairs];

  // ── HARD FILTERS ─────────────────────────────────────────────────────────

  if (filters.budget !== "all") {
    filtered = filtered.filter((c) => highChairBudgetTier(c.price) === filters.budget);
  }

  if (filters.chairType !== "all") {
    filtered = filtered.filter((c) => c.chairType === filters.chairType);
  }

  // city-apartment → hard filter to apartment-friendly / foldable / compact / hook-on
  if (filters.space === "apartment") {
    filtered = filtered.filter((c) => c.apartmentFriendly === true || c.foldable === true);
  } else if (filters.space === "house") {
    // house: no restriction, but boost full-size in sort
  }

  // tall-parent: hard filter to tray-adjustable chairs
  if (situations.includes("tall-parent")) {
    const tallFriendly = filtered.filter((c) => c.trayAdjustable === true);
    // Graceful degradation: only apply if result set is non-empty
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
    } else if (filters.priority === "easiest-clean") {
      // easyToClean is boolean; sort true first
      if (b.easyToClean !== a.easyToClean) return b.easyToClean ? 1 : -1;
    } else if (filters.priority === "top-rated") {
      return compareRatedByTrustDesc(a, b);
    }

    // Secondary: journey boost
    if (journeyType) {
      const boostA = highChairJourneyBoost(a, journeyType, situations);
      const boostB = highChairJourneyBoost(b, journeyType, situations);
      if (boostB !== boostA) return boostB - boostA;
    }

    return compareRatedByTrustDesc(a, b);
  });

  return filtered;
}