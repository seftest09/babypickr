import type { BabyMonitor, MonitorFilterState } from "@/types/product";
import type { JourneyTypeId, SituationId } from "@/lib/journeyStorage";
import { monitorJourneyBoost } from "@/lib/journeyStorage";
import { compareRatedByTrustDesc } from "@/lib/trustScore";

function monitorBudgetTier(price: number): "budget" | "mid" | "premium" {
  if (price < 100) return "budget";
  if (price <= 250) return "mid";
  return "premium";
}

export interface MonitorFilterOptions {
  journeyType?: JourneyTypeId;
  situations?: SituationId[];
}

export function filterMonitors(
  monitors: readonly BabyMonitor[],
  filters: MonitorFilterState,
  journey?: MonitorFilterOptions,
): BabyMonitor[] {
  const journeyType = journey?.journeyType;
  const situations = journey?.situations ?? [];

  let filtered = [...monitors];

  // ── HARD FILTERS ─────────────────────────────────────────────────────────

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
    filtered = filtered.filter((m) => ["720p", "1080p"].includes(m.videoQuality));
  } else if (filters.videoQuality === "hd") {
    filtered = filtered.filter((m) => ["2K", "4K"].includes(m.videoQuality));
  }

  // first-baby: soft-boost video monitors (no hard filter, but sorts them up)
  // No hard filter here — first-time parents should still see audio options

  // ── SORTING ───────────────────────────────────────────────────────────────

  filtered.sort((a, b) => {
    // Primary sort
    if (filters.priority === "value") {
      const priceDiff = a.price - b.price;
      if (priceDiff !== 0) return priceDiff;
    } else if (filters.priority === "battery") {
      // Sort by battery life: 12hrs+ > 8-12hrs > under-8hrs > no-battery
      const batteryRank: Record<string, number> = {
        "12hrs+": 4,
        "8-12hrs": 3,
        "under-8hrs": 2,
        "no-battery": 1,
      };
      const diff = (batteryRank[b.batteryLife] ?? 0) - (batteryRank[a.batteryLife] ?? 0);
      if (diff !== 0) return diff;
    } else if (filters.priority === "safety") {
      // Safety: prefer video + long range + higher rated
      const safetyA = (a.videoQuality !== "audio-only" ? 1 : 0) + (a.range === "long" ? 1 : 0);
      const safetyB = (b.videoQuality !== "audio-only" ? 1 : 0) + (b.range === "long" ? 1 : 0);
      if (safetyB !== safetyA) return safetyB - safetyA;
      // Tiebreak by trust score, not raw rating
      return compareRatedByTrustDesc(a, b);
    }

    // Secondary: journey boost
    if (journeyType) {
      const boostA = monitorJourneyBoost(a, journeyType, situations);
      const boostB = monitorJourneyBoost(b, journeyType, situations);
      if (boostB !== boostA) return boostB - boostA;
    }

    return compareRatedByTrustDesc(a, b);
  });

  return filtered;
}