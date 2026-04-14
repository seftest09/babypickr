import type { FilterState, Stroller } from "@/types/product";
import { compareRatedByTrustDesc } from "@/lib/trustScore";

function strollerBudgetTier(price: number): "budget" | "mid" | "premium" {
  if (price < 300) return "budget";
  if (price <= 700) return "mid";
  return "premium";
}

export function filterStrollers(strollers: readonly Stroller[], filters: FilterState): Stroller[] {
  let filtered = [...strollers];

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

  if (filters.priority === "portability") {
    filtered.sort((a, b) => a.weightLbs - b.weightLbs);
  } else if (filters.priority === "value") {
    filtered.sort((a, b) => a.price - b.price);
  } else {
    filtered.sort(compareRatedByTrustDesc);
  }

  return filtered;
}
