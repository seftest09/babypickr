"use client";

import { useEffect, useMemo, useState } from "react";
import { useProductAiSummary } from "@/hooks/useProductAiSummary";
import { useRouter } from "next/navigation";
import { CategoryNav } from "@/components/CategoryNav";
import { CategoryPageLayout } from "@/components/CategoryPageLayout";
import { FilterBar, type FilterGroup } from "@/components/FilterBar";
import { ProductCard } from "@/components/ProductCard";
import { ResultsGrid } from "@/components/ResultsGrid";
import type { CategoryId } from "@/lib/categories";
import { CATEGORY_HREFS } from "@/lib/categories";
import type { CarSeat, CarSeatFilterState } from "@/types/product";
import { carSeats as allCarSeats } from "@/data/car-seats";
import { getTag } from "@/config/affiliate";
import { buildAmazonLink } from "@/lib/affiliate";
import { filterCarSeats } from "@/lib/filters/carSeats";
import {
  applyJourneySituationsToCarSeatFilters,
  clearJourneyStorage,
  journeyExplanationsForCategory,
  journeyTypeLabel,
  readJourneyFromStorage,
  situationLabels,
  type JourneyStored,
} from "@/lib/journeyStorage";

const BUDGET_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Under $200", value: "budget" },
  { label: "$200-400", value: "mid" },
  { label: "$400+", value: "premium" },
] as const;

const SEAT_TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Infant", value: "infant" },
  { label: "Convertible", value: "convertible" },
  { label: "All-in-One", value: "all-in-one" },
] as const;

const VEHICLE_FIT_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Compact Car", value: "compact" },
  { label: "SUV or Minivan", value: "any" },
] as const;

const PRIORITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Lightest", value: "lightweight" },
  { label: "Top Rated", value: "safety" },
  { label: "Best Value", value: "value" },
] as const;

const CAR_SEAT_FILTER_GROUPS: readonly FilterGroup[] = [
  {
    key: "budget",
    label: "Budget",
    options: BUDGET_OPTIONS,
    optionWrapClassName: "flex flex-wrap gap-1.5 sm:gap-2",
  },
  { key: "seatType", label: "Seat type", options: SEAT_TYPE_OPTIONS },
  { key: "vehicleFit", label: "Vehicle Size", options: VEHICLE_FIT_OPTIONS },
  { key: "priority", label: "Priority", options: PRIORITY_OPTIONS },
];

const CAR_SEAT_FILTER_GRID =
  "grid grid-cols-2 gap-x-8 gap-y-6 sm:gap-x-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]";

function getCarSeatAmazonHref(seat: CarSeat): string {
  const raw = seat.asin?.trim() ?? "";
  if (raw && raw.toLowerCase() !== "unavailable") {
    return buildAmazonLink(raw);
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(seat.name)}&tag=${getTag()}`;
}

function seatTypeLabel(type: CarSeat["seatType"]): string {
  if (type === "all-in-one") return "All-in-One";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function seatTypeBadgeClass(type: CarSeat["seatType"]): string {
  if (type === "infant") return "bg-blue-100 text-blue-800";
  if (type === "convertible") return "bg-purple-100 text-purple-800";
  return "bg-teal-100 text-teal-800";
}

export default function CarSeatsPage() {
  const router = useRouter();
  const [journey, setJourney] = useState<JourneyStored | null>(null);
  const [filters, setFilters] = useState<CarSeatFilterState>({
    budget: "all",
    seatType: "all",
    vehicleFit: "all",
    priority: "all",
  });
  const [category, setCategory] = useState<CategoryId>("car-seats");

  useEffect(() => {
    const j = readJourneyFromStorage();
    if (!j) {
      router.replace("/?returnTo=/car-seats");
      return;
    }
    setJourney(j);
    setFilters((prev) => applyJourneySituationsToCarSeatFilters(j.situations, j.journeyType, prev));
  }, [router]);

  const startJourneyOver = () => {
    clearJourneyStorage();
    router.replace("/");
  };

  const results = useMemo(
    () =>
      journey
        ? filterCarSeats(allCarSeats, filters, {
            journeyType: journey.journeyType,
            situations: journey.situations,
          })
        : filterCarSeats(allCarSeats, filters),
    [filters, journey],
  );

  const { summaries, loadingSummaries, requestSummary } = useProductAiSummary(filters, "car seat");

  const hasActiveFilter =
    filters.budget !== "all" ||
    filters.seatType !== "all" ||
    filters.vehicleFit !== "all" ||
    filters.priority !== "all";

  const filterValues = useMemo(
    () => ({
      budget: filters.budget,
      seatType: filters.seatType,
      vehicleFit: filters.vehicleFit,
      priority: filters.priority,
    }),
    [filters],
  );

  function resetFilters() {
    setFilters({ budget: "all", seatType: "all", vehicleFit: "all", priority: "all" });
  }

  function handleFilterBarChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value } as CarSeatFilterState));
  }

  function handleCategorySelect(id: CategoryId) {
    const href = CATEGORY_HREFS[id];
    if (href) {
      router.push(href);
      return;
    }
    setCategory(id);
  }

  function isCategoryActiveForNav(id: CategoryId): boolean {
    if (id === "baby-monitors" || id === "cribs" || id === "high-chairs") return false;
    return id === "car-seats" ? category === "car-seats" : category === id;
  }

  const filterBar =
    category === "car-seats" ? (
      <FilterBar
        subtitle="Answer 4 quick questions to find your match"
        filterGroups={CAR_SEAT_FILTER_GROUPS}
        values={filterValues}
        gridClassName={CAR_SEAT_FILTER_GRID}
        onChange={handleFilterBarChange}
      />
    ) : null;

  const resultsHeader = (
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-6">
      {journey && (
        <div
          className="rounded-2xl border border-[#388E3C]/15 px-5 py-4 shadow-sm"
          style={{ background: "linear-gradient(135deg, #C8E6C9, #E3F2FD)" }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-dm-serif-display text-lg font-semibold text-[#1B4332]">
                ✦ Your personalized matches
              </p>
              <p className="mt-1 text-sm text-[#1A1A2E]/80">
                Based on:{" "}
                <span className="font-medium">
                  {situationLabels(journey.situations).join(" · ")}
                </span>
              </p>
              <p className="mt-1 text-sm text-[#1A1A2E]/70">
                Preparing for: <span className="font-medium">{journeyTypeLabel(journey.journeyType)}</span>
              </p>
              <div className="mt-2 space-y-1 text-sm text-[#1A1A2E]/75">
                {journeyExplanationsForCategory("car-seats", journey)
                  .slice(0, 3)
                  .map((line) => (
                    <p key={line}>{line}</p>
                  ))}
              </div>
            </div>
            <button
              type="button"
              onClick={startJourneyOver}
              className="shrink-0 text-sm font-medium text-[#388E3C] underline-offset-2 hover:underline"
            >
              ✕ Start over
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Results</p>
          <h2 className="font-dm-serif-display mt-1 text-2xl font-semibold tracking-tight text-[#1A1A2E]">
            {results.length === 1 ? "Showing 1 car seat" : `Showing ${results.length} car seats`}
          </h2>
        </div>
        <p className="max-w-md shrink-0 text-sm leading-relaxed text-[#6B7280]">
          Refined picks matched to your budget, seat type, and vehicle size.
        </p>
      </div>
    </div>
  );

  return (
    <CategoryPageLayout
      title="BabyPickr"
      tagline="Find the perfect baby gear for your exact situation"
      categoryNav={
        <CategoryNav isActiveFor={isCategoryActiveForNav} onSelect={handleCategorySelect} />
      }
      filterBar={filterBar}
    >
      {category !== "car-seats" ? (
        <div className="flex flex-col items-center px-4 py-16 sm:py-24">
          <div
            className="mb-6 flex h-36 w-full max-w-sm items-center justify-center rounded-3xl border border-[#388E3C]/20 bg-gradient-to-br from-[#C8E6C9] to-white text-[#388E3C]/40 shadow-inner"
            aria-hidden
          >
            <span className="text-5xl font-semibold tracking-tight text-[#388E3C]/80">Soon</span>
          </div>
          <p className="text-center text-2xl font-semibold tracking-tight text-gray-700">Coming soon</p>
          <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-[#6B7280]">
            We&apos;re expanding BabyPickr beyond car seats. Pick another tab or switch back to Car Seats to
            explore picks today.
          </p>
        </div>
      ) : (
        <ResultsGrid
          results={results}
          resultsHeader={resultsHeader}
          emptyMessage="No car seats match your filters"
          onResetFilters={resetFilters}
          renderCard={(seat) => (
            <ProductCard
              product={seat}
              amazonHref={getCarSeatAmazonHref(seat)}
              hasActiveFilter={hasActiveFilter}
              summary={summaries[seat.id]}
              isLoadingSummary={Boolean(loadingSummaries[seat.id])}
              onRequestSummary={() => void requestSummary(seat)}
              afterStars={
                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/5 ${seatTypeBadgeClass(seat.seatType)}`}
                  >
                    {seatTypeLabel(seat.seatType)}
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200/70">
                    Up to {seat.weightLimitLbs} lbs
                  </span>
                </div>
              }
              afterTopFeature={
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200/70">
                      {seat.weightLbs} lbs
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                        seat.latchCompatible
                          ? "bg-[#E3F2FD] text-[#1A1A2E] ring-[#5B9BD5]/35"
                          : "bg-gray-100 text-gray-500 ring-gray-200/70"
                      }`}
                    >
                      LATCH
                    </span>
                  </div>

                  {seat.bestFor?.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-medium text-gray-500">Best for:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {seat.bestFor.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[#C8E6C9] px-2 py-0.5 text-xs font-medium text-[#1B4332] ring-1 ring-[#388E3C]/25"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {seat.worstFor?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500">Watch out:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {seat.worstFor.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 ring-1 ring-red-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              }
            />
          )}
        />
      )}
    </CategoryPageLayout>
  );
}
