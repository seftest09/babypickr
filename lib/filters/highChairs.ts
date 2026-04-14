import type { HighChair, HighChairFilterState } from "@/types/product";
import { compareRatedByTrustDesc, effectiveRatingReview } from "@/lib/trustScore";

function highChairBudgetTier(price: number): "budget" | "mid" | "premium" {
  if (price < 100) return "budget";
  if (price <= 200) return "mid";
  return "premium";
}

export function filterHighChairs(chairs: readonly HighChair[], filters: HighChairFilterState): HighChair[] {
  let filtered = [...chairs];

  if (filters.budget !== "all") {
    filtered = filtered.filter((h) => highChairBudgetTier(h.price) === filters.budget);
  }

  if (filters.chairType !== "all") {
    filtered = filtered.filter((h) => h.chairType === filters.chairType);
  }

  if (filters.space === "apartment") {
    filtered = filtered.filter((h) => h.apartmentFriendly === true);
  } else if (filters.space === "house") {
    filtered = filtered.filter((h) => h.apartmentFriendly === false);
  }

  if (filters.priority === "easiest-clean") {
    filtered = filtered.filter((h) => h.easyToClean === true);
    filtered.sort(compareRatedByTrustDesc);
  } else if (filters.priority === "value") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (filters.priority === "top-rated") {
    filtered.sort((a, b) => {
      const rb = effectiveRatingReview(b).rating;
      const ra = effectiveRatingReview(a).rating;
      return rb - ra;
    });
  } else {
    filtered.sort(compareRatedByTrustDesc);
  }

  return filtered;
}
