import type { FilterState } from "@/types/product";
import type {
  CarSeatFilterState,
  CribFilterState,
  HighChairFilterState,
  MonitorFilterState,
} from "@/types/product";

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

// ─── Labels ──────────────────────────────────────────────────────────────────

const JOURNEY_TYPE_LABELS: Record<JourneyTypeId, string> = {
  "first-baby": "First baby arriving",
  upgrading: "Upgrading gear",
  "second-child": "Second child",
  gift: "Buying a gift",
};

export function journeyTypeLabel(id: JourneyTypeId): string {
  return JOURNEY_TYPE_LABELS[id] ?? id;
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

// ─── Storage I/O ─────────────────────────────────────────────────────────────

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

// ─── Journey Explanations (banner copy) ──────────────────────────────────────
// These are shown in the personalized banner on each category page.
// Every journey answer must produce at least one visible line here.

export type JourneyCategoryId =
  | "strollers"
  | "car-seats"
  | "baby-monitors"
  | "cribs"
  | "high-chairs";

export function journeyExplanationsForCategory(
  category: JourneyCategoryId,
  stored: JourneyStored,
): string[] {
  const s = stored.situations;
  const lines: string[] = [];

  // ── Journey type: always produces a line (copy-only for most, boost/filter noted) ──
  if (category === "strollers") {
    if (stored.journeyType === "first-baby")
      lines.push("Showing beginner-friendly strollers that are easy to learn and set up.");
    else if (stored.journeyType === "upgrading")
      lines.push("Highlighting premium and highly-rated upgrades worth the switch.");
    else if (stored.journeyType === "second-child")
      lines.push("Prioritizing strollers that can expand or convert to double seating.");
    else if (stored.journeyType === "gift")
      lines.push("Showing popular, well-reviewed strollers that make impressive gifts.");
  } else if (category === "car-seats") {
    if (stored.journeyType === "first-baby")
      lines.push("Showing infant and convertible seats with the clearest safety credentials.");
    else if (stored.journeyType === "upgrading")
      lines.push("Filtered to convertible seats — the meaningful upgrade for growing kids.");
    else if (stored.journeyType === "second-child")
      lines.push("Filtered to convertible and all-in-one seats suited for multiple children.");
    else if (stored.journeyType === "gift")
      lines.push("Showing the safest, most popular seats — ideal for gifting.");
  } else if (category === "baby-monitors") {
    if (stored.journeyType === "first-baby")
      lines.push("Recommending video + audio monitors so you can see and hear everything.");
    else if (stored.journeyType === "upgrading")
      lines.push("Highlighting smart monitors with app control and advanced alerts.");
    else if (stored.journeyType === "second-child")
      lines.push("Boosting monitors that support multiple cameras or multi-room coverage.");
    else if (stored.journeyType === "gift")
      lines.push("Showing mid-range monitors that are easy to set up and loved by parents.");
  } else if (category === "cribs") {
    if (stored.journeyType === "first-baby")
      lines.push("Highlighting cribs that meet the strictest safety standards with easy assembly.");
    else if (stored.journeyType === "upgrading")
      lines.push("Prioritizing convertible cribs that grow with your child for years.");
    else if (stored.journeyType === "second-child")
      lines.push("Note: check your existing crib meets current safety standards before reusing.");
    else if (stored.journeyType === "gift")
      lines.push("Showing cribs that are stunning to look at and easy for parents to assemble.");
  } else if (category === "high-chairs") {
    if (stored.journeyType === "first-baby")
      lines.push("Highlighting chairs that recline for infants and grow with your baby.");
    else if (stored.journeyType === "upgrading")
      lines.push("Prioritizing grow-with-me chairs that adjust as your child gets bigger.");
    else if (stored.journeyType === "second-child")
      lines.push("Boosting durable, easy-to-clean chairs built for heavy everyday use.");
    else if (stored.journeyType === "gift")
      lines.push("Showing stylish, popular chairs that parents love receiving as gifts.");
  }

  // ── Situations: each one explains what it does in this category ──
  if (category === "strollers") {
    if (s.includes("city-apartment"))
      lines.push("Filtered to apartment-friendly strollers that fit in small hallways and elevators.");
    if (s.includes("house-suburbs"))
      lines.push("Showing full-size strollers with more storage and all-terrain capability.");
    if (s.includes("tall-parent"))
      lines.push("Filtered to tall-parent-friendly handlebars (no back pain on every walk).");
    if (s.includes("travel-often"))
      lines.push("Sorted by weight — lighter strollers first for easier travel.");
    if (s.includes("compact-car"))
      lines.push("Sorted by fold size and weight for easier trunk loading.");
    if (s.includes("value-matters"))
      lines.push("Sorted by price so the best value options come first.");
  } else if (category === "car-seats") {
    if (s.includes("compact-car"))
      lines.push("Filtered to narrow-base seats proven to fit compact vehicles.");
    if (s.includes("travel-often"))
      lines.push("Boosting FAA-approved and lightweight seats for easier air travel.");
    if (s.includes("tall-parent"))
      lines.push("Boosting seats with adjustable headrests that grow with taller children.");
    if (s.includes("city-apartment"))
      lines.push("Boosting lightweight seats that are easier to carry up stairs and into transit.");
    if (s.includes("value-matters"))
      lines.push("Sorted by price so the best value seats come first.");
    if (s.includes("house-suburbs"))
      lines.push("Showing the full range — no space constraints for suburb families.");
  } else if (category === "baby-monitors") {
    if (s.includes("travel-often"))
      lines.push("Boosting battery-powered and portable monitors for travel and hotels.");
    if (s.includes("city-apartment"))
      lines.push("Boosting compact, portable monitors well-suited to smaller spaces.");
    if (s.includes("house-suburbs"))
      lines.push("Boosting long-range monitors that cover larger homes and backyards.");
    if (s.includes("value-matters"))
      lines.push("Sorted by price so the best value monitors come first.");
    if (s.includes("compact-car"))
      lines.push("Boosting portable monitors that pack easily for on-the-go families.");
    if (s.includes("tall-parent"))
      lines.push("No specific monitor filters for parent height — showing all options.");
  } else if (category === "cribs") {
    if (s.includes("city-apartment"))
      lines.push("Filtered to compact and mini cribs that fit in smaller nurseries.");
    if (s.includes("tall-parent"))
      lines.push("Filtered to cribs with adjustable mattress height — easier on your back.");
    if (s.includes("travel-often"))
      lines.push("Boosting portable cribs and travel-friendly options.");
    if (s.includes("value-matters"))
      lines.push("Sorted by price so the best value cribs come first.");
    if (s.includes("house-suburbs"))
      lines.push("Showing the full crib range — no space constraints for suburb families.");
    if (s.includes("compact-car"))
      lines.push("Boosting cribs with easier flat-pack shipping for transport.");
  } else if (category === "high-chairs") {
    if (s.includes("city-apartment"))
      lines.push("Filtered to space-saving and foldable high chairs.");
    if (s.includes("house-suburbs"))
      lines.push("Showing full-size high chairs with all the features.");
    if (s.includes("tall-parent"))
      lines.push("Filtered to chairs with adjustable trays — more comfortable for taller parents.");
    if (s.includes("travel-often"))
      lines.push("Boosting compact fold and hook-on chairs easy to bring along.");
    if (s.includes("compact-car"))
      lines.push("Boosting foldable chairs that fit easily into a car trunk.");
    if (s.includes("value-matters"))
      lines.push("Sorted by price so the best value chairs come first.");
  }

  return lines;
}

// ─── Filter application functions ────────────────────────────────────────────
// Rules per the planning matrix:
//   HARD FILTER  → sets a filter field that removes non-matching products
//   SOFT BOOST   → sets a journeyBoost priority hint (not a hard filter)
//   COPY ONLY    → handled in journeyExplanationsForCategory above, no filter change
//   UNUSED       → no action (acknowledged)
//
// journeyType influence notes per category:
//   upgrading    → strollers: soft boost top-rated | car-seats: hard filter convertible types
//   second-child → strollers: soft boost double | car-seats: hard filter convertible/all-in-one
//   first-baby   → copy only across all categories (safety-first copy in explanations)
//   gift         → copy only across all categories (popularity/giftability copy)

export function applyJourneySituationsToStrollerFilters(
  situations: SituationId[],
  journeyType: JourneyTypeId,
  base: FilterState,
): FilterState {
  const next: FilterState = { ...base };

  // ── HARD FILTERS ──
  // city-apartment → only show apartment-friendly strollers
  if (situations.includes("city-apartment")) next.space = "apartment";
  // house-suburbs → show house-suited strollers (larger, more storage)
  else if (situations.includes("house-suburbs")) next.space = "house";
  // tall-parent → hard filter to tall-parent-friendly handlebars
  if (situations.includes("tall-parent")) next.parentHeight = "tall";

  // ── SOFT BOOSTS (set priority for sort order) ──
  // Priority precedence: value > portability/travel > default
  // value-matters wins if set
  if (situations.includes("value-matters")) {
    next.priority = "value";
  } else if (situations.includes("travel-often") || situations.includes("compact-car")) {
    // travel-often AND compact-car both benefit from lighter/more portable strollers
    next.priority = "portability";
  }

  // journeyType soft boosts:
  // second-child → prefer double-capable (handled in filterStrollers sort)
  // upgrading → prefer premium/convertible (handled in filterStrollers sort)
  // first-baby + gift → copy only, no filter change

  return next;
}

export function applyJourneySituationsToCarSeatFilters(
  situations: SituationId[],
  journeyType: JourneyTypeId,
  base: CarSeatFilterState,
): CarSeatFilterState {
  const next: CarSeatFilterState = { ...base };

  // ── HARD FILTERS ──
  // compact-car → only compact-vehicle-friendly seats
  if (situations.includes("compact-car")) next.vehicleFit = "compact";

  // journeyType HARD FILTERS:
  // upgrading → filter to convertible seats (the real upgrade from infant-only)
  if (journeyType === "upgrading") next.seatType = "convertible";
  // second-child → filter to convertible or all-in-one (multi-year use, multiple kids)
  // We can't set two values in seatType, so we use "convertible" as the primary
  // and handle all-in-one boost in the filter function via journeyType param
  if (journeyType === "second-child") next.seatType = "convertible";

  // ── SOFT BOOSTS (priority sort) ──
  if (situations.includes("value-matters") && next.priority === "all") {
    next.priority = "value";
  }
  if (situations.includes("travel-often") && next.priority === "all") {
    next.priority = "lightweight";
  }

  return next;
}

export function applyJourneySituationsToCribFilters(
  situations: SituationId[],
  journeyType: JourneyTypeId,
  base: CribFilterState,
): CribFilterState {
  const next: CribFilterState = { ...base };

  // ── HARD FILTERS ──
  // city-apartment → compact/mini cribs only
  if (situations.includes("city-apartment")) {
    next.priority = "compact";
  }
  // tall-parent → filter to adjustable mattress height (handled in filter fn)
  // No CribFilterState field for this yet, handled via journeyType param in filterCribs

  // journeyType HARD FILTERS:
  // upgrading → filter to convertible cribs
  if (journeyType === "upgrading") next.convertible = "yes";

  // ── SOFT BOOSTS ──
  // value-matters overrides compact priority
  if (situations.includes("value-matters")) next.priority = "value";

  return next;
}

export function applyJourneySituationsToHighChairFilters(
  situations: SituationId[],
  journeyType: JourneyTypeId,
  base: HighChairFilterState,
): HighChairFilterState {
  const next: HighChairFilterState = { ...base };

  // ── HARD FILTERS ──
  // city-apartment → compact/foldable/hook-on types only
  if (situations.includes("city-apartment")) next.space = "apartment";
  // house-suburbs → full-size allowed
  else if (situations.includes("house-suburbs")) next.space = "house";
  // tall-parent → filter to adjustable tray (handled in filterHighChairs via journeyType param)

  // ── SOFT BOOSTS ──
  if (situations.includes("value-matters")) next.priority = "value";

  // journeyType soft boosts (sort order in filterHighChairs):
  // upgrading → boost grow-with-me chairs
  // second-child → boost easy-to-clean durable chairs

  return next;
}

export function applyJourneySituationsToMonitorFilters(
  situations: SituationId[],
  journeyType: JourneyTypeId,
  base: MonitorFilterState,
): MonitorFilterState {
  const next: MonitorFilterState = { ...base };

  // Monitors have no hard spatial filter (apartment vs house doesn't restrict monitors,
  // it influences which type is BEST → soft boost only)

  // ── SOFT BOOSTS ──
  if (situations.includes("value-matters") && next.priority === "all") {
    next.priority = "value";
  }
  if (situations.includes("travel-often") && next.priority === "all") {
    next.priority = "battery";
  }

  // journeyType soft boosts (sort order in filterMonitors):
  // upgrading → boost smart/app-enabled monitors
  // second-child → boost multi-room / multi-camera monitors
  // first-baby + gift → copy only

  return next;
}

// ─── Journey boost scoring ────────────────────────────────────────────────────
// These functions compute a 0–5 numeric bonus applied during sorting.
// A product perfectly matching the parent's situation scores higher.
// Used as a secondary sort key AFTER the primary filter/priority sort.

export function strollerJourneyBoost(
  product: { isDoubleCapable?: boolean; isConvertible?: boolean; isTravelFriendly?: boolean; budgetTier: string; apartmentFriendly: boolean; tallParentFriendly: boolean },
  journeyType: JourneyTypeId,
  situations: SituationId[],
): number {
  let boost = 0;
  if (journeyType === "second-child" && product.isDoubleCapable) boost += 3;
  if (journeyType === "upgrading" && (product.isConvertible || product.budgetTier === "premium")) boost += 2;
  if (journeyType === "gift" && product.budgetTier === "mid") boost += 1; // mid-tier gifts are safest
  if (situations.includes("travel-often") && product.isTravelFriendly) boost += 2;
  if (situations.includes("city-apartment") && product.apartmentFriendly) boost += 1;
  if (situations.includes("tall-parent") && product.tallParentFriendly) boost += 1;
  return boost;
}

export function carSeatJourneyBoost(
  product: { isFaaApproved?: boolean; isExtendedRear?: boolean; headrestAdjustable?: boolean; seatType: string; budgetTier: string },
  journeyType: JourneyTypeId,
  situations: SituationId[],
): number {
  let boost = 0;
  if (journeyType === "second-child" && product.seatType === "all-in-one") boost += 2;
  if (journeyType === "upgrading" && product.isExtendedRear) boost += 2;
  if (journeyType === "first-baby" && product.seatType === "infant") boost += 1;
  if (situations.includes("travel-often") && product.isFaaApproved) boost += 3;
  if (situations.includes("tall-parent") && product.headrestAdjustable) boost += 2;
  if (situations.includes("city-apartment") && product.budgetTier !== "premium") boost += 1;
  return boost;
}

export function monitorJourneyBoost(
  product: { hasSmartFeatures?: boolean; hasMultiRoom?: boolean; isPortable?: boolean; batteryLife: string; budgetTier: string },
  journeyType: JourneyTypeId,
  situations: SituationId[],
): number {
  let boost = 0;
  if (journeyType === "upgrading" && product.hasSmartFeatures) boost += 3;
  if (journeyType === "second-child" && product.hasMultiRoom) boost += 3;
  if (journeyType === "first-baby" && !product.hasSmartFeatures) boost += 1; // simpler = less overwhelming
  if (situations.includes("travel-often") && (product.isPortable || product.batteryLife === "12hrs+")) boost += 2;
  if (situations.includes("city-apartment") && product.isPortable) boost += 1;
  if (situations.includes("house-suburbs") && product.hasMultiRoom) boost += 2;
  if (journeyType === "gift" && product.budgetTier === "mid") boost += 1;
  return boost;
}

export function cribJourneyBoost(
  product: { convertible: boolean; adjustableMattressHeight?: boolean; isPortable?: boolean; isGiftable?: boolean; budgetTier: string },
  journeyType: JourneyTypeId,
  situations: SituationId[],
): number {
  let boost = 0;
  if (journeyType === "upgrading" && product.convertible) boost += 3;
  if (journeyType === "gift" && product.isGiftable) boost += 2;
  if (journeyType === "second-child" && product.convertible) boost += 1; // reuse potential
  if (situations.includes("tall-parent") && product.adjustableMattressHeight) boost += 3;
  if (situations.includes("travel-often") && product.isPortable) boost += 2;
  if (situations.includes("city-apartment") && product.budgetTier !== "premium") boost += 1;
  return boost;
}

export function highChairJourneyBoost(
  product: { growsWithChild?: boolean; trayAdjustable?: boolean; isCompactFold?: boolean; easyToClean: boolean; budgetTier: string },
  journeyType: JourneyTypeId,
  situations: SituationId[],
): number {
  let boost = 0;
  if (journeyType === "upgrading" && product.growsWithChild) boost += 3;
  if (journeyType === "second-child" && product.easyToClean) boost += 2;
  if (journeyType === "gift" && product.budgetTier === "mid") boost += 1;
  if (situations.includes("tall-parent") && product.trayAdjustable) boost += 3;
  if (situations.includes("travel-often") && product.isCompactFold) boost += 2;
  if (situations.includes("compact-car") && product.isCompactFold) boost += 2;
  if (situations.includes("city-apartment") && product.isCompactFold) boost += 1;
  return boost;
}

// ─── Legacy compat shims (no-arg journey type versions) ──────────────────────
// Keep these so existing call sites that don't yet pass journeyType still compile.
// Delete these once all call sites are updated.

export function journeyRequestsCompactCar(situations: SituationId[]): boolean {
  return situations.includes("compact-car");
}