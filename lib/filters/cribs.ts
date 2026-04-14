import type { Crib, CribFilterState } from "@/types/product";
import { compareRatedByTrustDesc, effectiveRatingReview } from "@/lib/trustScore";

function cribBudgetTier(price: number): "budget" | "mid" | "premium" {
  if (price < 250) return "budget";
  if (price <= 500) return "mid";
  return "premium";
}

export function filterCribs(cribs: readonly Crib[], filters: CribFilterState): Crib[] {
  let filtered = [...cribs];

  if (filters.budget !== "all") {
    filtered = filtered.filter((c) => cribBudgetTier(c.price) === filters.budget);
  }

  if (filters.convertible === "yes") {
    filtered = filtered.filter((c) => c.convertible === true);
  } else if (filters.convertible === "no") {
    filtered = filtered.filter((c) => c.convertible === false);
  }

  if (filters.material !== "all") {
    filtered = filtered.filter((c) => c.materialType === filters.material);
  }

  if (filters.priority === "value") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (filters.priority === "top-rated") {
    filtered.sort((a, b) => {
      const rb = effectiveRatingReview(b).rating;
      const ra = effectiveRatingReview(a).rating;
      return rb - ra;
    });
  } else if (filters.priority === "compact") {
    filtered = filtered.filter((c) => c.apartmentFriendly === true);
    filtered.sort(compareRatedByTrustDesc);
  } else {
    filtered.sort(compareRatedByTrustDesc);
  }

  return filtered;
}
