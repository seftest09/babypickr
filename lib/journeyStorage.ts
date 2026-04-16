import type { FilterState } from "@/types/product";

export const JOURNEY_STORAGE_KEY = "babypickr_journey_done";

export type JourneyTypeId = "first-baby" | "upgrading" | "second-child" | "gift";

export type SituationId =
  | "city-apartment"
  | "house-suburbs"
  | "travel-often"
  | "compact-car"
  | "tall-parent"
  | "value-matters";

export type JourneyStored = {
  journeyType: JourneyTypeId;
  situations: SituationId[];
};

export function readJourneyFromStorage(): JourneyStored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(JOURNEY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Partial<JourneyStored>;
    if (!o.journeyType || !Array.isArray(o.situations)) return null;
    return {
      journeyType: o.journeyType,
      situations: o.situations.filter((s): s is SituationId =>
        [
          "city-apartment",
          "house-suburbs",
          "travel-often",
          "compact-car",
          "tall-parent",
          "value-matters",
        ].includes(s as string),
      ),
    };
  } catch {
    return null;
  }
}

export function writeJourneyToStorage(data: JourneyStored): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

export function clearJourneyStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(JOURNEY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const SITUATION_LABELS: Record<SituationId, string> = {
  "city-apartment": "City / Apartment",
  "house-suburbs": "House / Suburbs",
  "travel-often": "Travel often",
  "compact-car": "Compact car",
  "tall-parent": "Tall parent 6ft+",
  "value-matters": "Value matters",
};

export function situationLabels(ids: SituationId[]): string[] {
  return ids.map((id) => SITUATION_LABELS[id] ?? id);
}

export function applyJourneySituationsToStrollerFilters(
  situations: SituationId[],
  base: FilterState,
): FilterState {
  const next: FilterState = { ...base };
  if (situations.includes("city-apartment")) next.space = "apartment";
  if (situations.includes("house-suburbs")) next.space = "house";
  if (situations.includes("tall-parent")) next.parentHeight = "tall";
  if (situations.includes("value-matters")) next.priority = "value";
  else if (situations.includes("travel-often")) next.priority = "portability";
  return next;
}

export function journeyRequestsCompactCar(situations: SituationId[]): boolean {
  return situations.includes("compact-car");
}
