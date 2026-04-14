import type { BabyMonitor, MonitorFilterState } from "@/types/product";
import { compareRatedByTrustDesc, effectiveRatingReview } from "@/lib/trustScore";

function monitorBudgetTier(price: number): "budget" | "mid" | "premium" {
  if (price < 150) return "budget";
  if (price <= 300) return "mid";
  return "premium";
}

function batteryRank(life: BabyMonitor["batteryLife"]): number {
  if (life === "12hrs+") return 3;
  if (life === "8-12hrs") return 2;
  if (life === "under-8hrs") return 1;
  return 0;
}

export function filterMonitors(monitors: readonly BabyMonitor[], filters: MonitorFilterState): BabyMonitor[] {
  let filtered = [...monitors];

  if (filters.budget !== "all") {
    filtered = filtered.filter((m) => monitorBudgetTier(m.price) === filters.budget);
  }

  if (filters.connectivity === "wifi") {
    filtered = filtered.filter((m) => m.wifiRequired === true);
  } else if (filters.connectivity === "non-wifi") {
    filtered = filtered.filter((m) => m.wifiRequired === false);
  }

  if (filters.videoQuality === "audio-only") {
    filtered = filtered.filter((m) => m.videoQuality === "audio-only");
  } else if (filters.videoQuality === "standard") {
    filtered = filtered.filter((m) => m.videoQuality === "720p");
  } else if (filters.videoQuality === "hd") {
    filtered = filtered.filter(
      (m) => m.videoQuality === "1080p" || m.videoQuality === "2K" || m.videoQuality === "4K",
    );
  }

  if (filters.priority === "safety") {
    filtered.sort((a, b) => {
      const rb = effectiveRatingReview(b).rating;
      const ra = effectiveRatingReview(a).rating;
      return rb - ra;
    });
  } else if (filters.priority === "value") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (filters.priority === "battery") {
    filtered = filtered.filter((m) => m.batteryLife !== "no-battery");
    filtered.sort((a, b) => batteryRank(b.batteryLife) - batteryRank(a.batteryLife));
  } else {
    filtered.sort(compareRatedByTrustDesc);
  }

  return filtered;
}
