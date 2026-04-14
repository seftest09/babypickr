import type { CarSeat, CarSeatFilterState } from "@/types/product";
import { compareRatedByTrustDesc, effectiveRatingReview } from "@/lib/trustScore";

function carSeatBudgetTier(price: number): "budget" | "mid" | "premium" {
  if (price < 200) return "budget";
  if (price <= 400) return "mid";
  return "premium";
}

export function filterCarSeats(seats: readonly CarSeat[], filters: CarSeatFilterState): CarSeat[] {
  let filtered = [...seats];

  if (filters.budget !== "all") {
    filtered = filtered.filter((s) => carSeatBudgetTier(s.price) === filters.budget);
  }

  if (filters.seatType !== "all") {
    filtered = filtered.filter((s) => s.seatType === filters.seatType);
  }

  if (filters.vehicleFit === "compact") {
    filtered = filtered.filter((s) => s.vehicleFit === "compact");
  }

  if (filters.priority === "lightweight") {
    filtered.sort((a, b) => a.weightLbs - b.weightLbs);
  } else if (filters.priority === "safety") {
    filtered.sort((a, b) => {
      const rb = effectiveRatingReview(b).rating;
      const ra = effectiveRatingReview(a).rating;
      return rb - ra;
    });
  } else if (filters.priority === "value") {
    filtered.sort((a, b) => a.price - b.price);
  } else {
    filtered.sort(compareRatedByTrustDesc);
  }

  return filtered;
}
