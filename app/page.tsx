"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryNav } from "@/components/CategoryNav";
import { CategoryPageLayout } from "@/components/CategoryPageLayout";
import { FilterBar, type FilterGroup } from "@/components/FilterBar";
import { JourneyFlow } from "@/components/JourneyFlow";
import { ProductCard } from "@/components/ProductCard";
import { ResultsGrid } from "@/components/ResultsGrid";
import type { CategoryId } from "@/lib/categories";
import { CATEGORY_HREFS } from "@/lib/categories";
import {
  applyJourneySituationsToStrollerFilters,
  clearJourneyStorage,
  readJourneyFromStorage,
  journeyExplanationsForCategory,
  journeyTypeLabel,
  situationLabels,
  writeJourneyToStorage,
  type JourneyStored,
  type SituationId,
} from "@/lib/journeyStorage";
import { Stroller, FilterState } from "@/types/product";
import { strollers as allStrollers } from "@/data/strollers";
import { getTag } from "@/config/affiliate";
import { buildAmazonLink } from "@/lib/affiliate";
import { filterStrollers } from "@/lib/filters/strollers";
import { useProductAiSummary } from "@/hooks/useProductAiSummary";

const INITIAL_FILTERS: FilterState = {
  budget: "all",
  space: "all",
  parentHeight: "all",
  priority: "all",
};

const BUDGET_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Under $300", value: "budget" },
  { label: "$300-700", value: "mid" },
  { label: "$700+", value: "premium" },
] as const;

const SPACE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
] as const;

const HEIGHT_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Under 5'6\"", value: "short" },
  { label: "5'6\"-6'", value: "average" },
  { label: "Over 6'", value: "tall" },
] as const;

const PRIORITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Most Portable", value: "portability" },
  { label: "Best Value", value: "value" },
  { label: "Car Seat Compatible", value: "carSeat" },
] as const;

const STROLLER_FILTER_GROUPS: readonly FilterGroup[] = [
  {
    key: "budget",
    label: "Budget",
    options: BUDGET_OPTIONS,
    optionWrapClassName: "flex flex-wrap gap-1.5 sm:gap-2",
  },
  { key: "space", label: "Living space", options: SPACE_OPTIONS },
  { key: "parentHeight", label: "Parent height", options: HEIGHT_OPTIONS },
  { key: "priority", label: "Priority", options: PRIORITY_OPTIONS },
];

function getStrollerAmazonHref(stroller: Stroller): string {
  const raw = stroller.asin?.trim() ?? "";
  if (raw && raw.toLowerCase() !== "unavailable") {
    return buildAmazonLink(raw);
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(stroller.name)}&tag=${getTag()}`;
}

type BannerMode = "none" | "fresh" | "storage";

export default function Home() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [journeyComplete, setJourneyComplete] = useState(false);
  const [bannerMode, setBannerMode] = useState<BannerMode>("none");
  const [storedSituations, setStoredSituations] = useState<SituationId[]>([]);
  const [storedJourneyType, setStoredJourneyType] = useState<JourneyStored["journeyType"] | null>(null);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [category, setCategory] = useState<CategoryId>("strollers");

  const { summaries, loadingSummaries, requestSummary } = useProductAiSummary(filters, "stroller");

  useEffect(() => {
    const stored = readJourneyFromStorage();
    if (stored) {
      setStoredSituations(stored.situations);
      setStoredJourneyType(stored.journeyType);
      setFilters(applyJourneySituationsToStrollerFilters(stored.situations, stored.journeyType, INITIAL_FILTERS));
      setJourneyComplete(true);
      setBannerMode("storage");
    }
    setHydrated(true);
  }, []);

  const results = useMemo(
    () =>
      filterStrollers(
        allStrollers,
        filters,
        storedJourneyType
          ? { journeyType: storedJourneyType, situations: storedSituations }
          : undefined,
      ),
    [filters, storedJourneyType, storedSituations],
  );

  const hasActiveFilter =
    filters.budget !== "all" ||
    filters.space !== "all" ||
    filters.parentHeight !== "all" ||
    filters.priority !== "all";

  const filterValues = useMemo(
    () => ({
      budget: filters.budget,
      space: filters.space,
      parentHeight: filters.parentHeight,
      priority: filters.priority,
    }),
    [filters],
  );

  const handleJourneyComplete = useCallback((data: JourneyStored) => {
    writeJourneyToStorage(data);
    setStoredSituations(data.situations);
    setStoredJourneyType(data.journeyType);
    setFilters(applyJourneySituationsToStrollerFilters(data.situations, data.journeyType, INITIAL_FILTERS));
    setJourneyComplete(true);
    setBannerMode("fresh");
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo");
      if (returnTo && returnTo.startsWith("/")) {
        router.replace(returnTo);
      }
    }
  }, [router]);

  const startJourneyOver = useCallback(() => {
    clearJourneyStorage();
    setJourneyComplete(false);
    setBannerMode("none");
    setStoredSituations([]);
    setStoredJourneyType(null);
    setFilters({ ...INITIAL_FILTERS });
  }, []);

  function resetFilters() {
    setFilters({ ...INITIAL_FILTERS });
  }

  function handleFilterChange(field: keyof FilterState, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleCategorySelect(id: CategoryId) {
    if (id === "strollers") {
      setCategory("strollers");
      return;
    }
    const href = CATEGORY_HREFS[id];
    if (href) {
      router.push(href);
      return;
    }
    setCategory(id);
  }

  function isCategoryActiveForNav(id: CategoryId): boolean {
    if (id === "car-seats" || id === "baby-monitors" || id === "cribs" || id === "high-chairs") {
      return false;
    }
    if (id === "strollers") return category === "strollers";
    return category === id;
  }

  const filterBar =
    category === "strollers" ? (
      <FilterBar
        subtitle="Answer 4 quick questions to find your match"
        filterGroups={STROLLER_FILTER_GROUPS}
        values={filterValues}
        onChange={(key, value) => handleFilterChange(key as keyof FilterState, value)}
      />
    ) : null;

  const basedOnText =
    storedSituations.length > 0
      ? situationLabels(storedSituations).join(" · ")
      : "Your selections";

  const journeyExplanationLines =
    storedJourneyType && storedSituations
      ? journeyExplanationsForCategory("strollers", {
          journeyType: storedJourneyType,
          situations: storedSituations,
        }).slice(0, 3)
      : [];

  const personalizedBanner =
    bannerMode === "fresh" ? (
      <div
        className="mb-6 rounded-2xl border border-[#388E3C]/15 px-5 py-4 shadow-sm"
        style={{ background: "linear-gradient(135deg, #C8E6C9, #E3F2FD)" }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-dm-serif-display text-lg font-semibold text-[#1B4332]">
              ✦ Your personalized matches
            </p>
            <p className="mt-1 text-sm text-[#1A1A2E]/80">
              Based on: <span className="font-medium">{basedOnText}</span>
            </p>
            {storedJourneyType && (
              <p className="mt-1 text-sm text-[#1A1A2E]/70">
                Preparing for: <span className="font-medium">{journeyTypeLabel(storedJourneyType)}</span>
              </p>
            )}
            {journeyExplanationLines.length > 0 && (
              <div className="mt-2 space-y-1 text-sm text-[#1A1A2E]/75">
                {journeyExplanationLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            )}
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
    ) : bannerMode === "storage" ? (
      <div className="mb-6 flex flex-col gap-2 rounded-xl border border-[#388E3C]/20 bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[#1A1A2E]">
          <p>
            <span className="font-dm-serif-display font-semibold text-[#2D6A4F]">✦</span> Based on your
            previous answers
          </p>
          {storedJourneyType && (
            <p className="mt-1 text-[#1A1A2E]/70">
              Preparing for: <span className="font-medium">{journeyTypeLabel(storedJourneyType)}</span>
            </p>
          )}
          {journeyExplanationLines.length > 0 && (
            <div className="mt-2 space-y-1 text-[#1A1A2E]/75">
              {journeyExplanationLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={startJourneyOver}
          className="text-sm font-semibold text-[#388E3C] hover:underline"
        >
          Start fresh →
        </button>
      </div>
    ) : null;

  const resultsHeader = (
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-5">
      {personalizedBanner}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Results</p>
          <h2 className="font-dm-serif-display mt-1 text-[26px] font-semibold tracking-tight text-[#1A1A2E]">
            {results.length === 1 ? "Showing 1 stroller" : `Showing ${results.length} strollers`}
          </h2>
        </div>
        <p className="max-w-md shrink-0 text-sm leading-relaxed text-[#6B7280]">
          Refined picks that respect your space, height, and what matters most day to day.
        </p>
      </div>
    </div>
  );

  if (!hydrated) {
    return <div className="min-h-screen bg-[#F2F7F2]" aria-busy="true" />;
  }

  if (!journeyComplete) {
    return <JourneyFlow onComplete={handleJourneyComplete} />;
  }

  return (
    <CategoryPageLayout
      title="BabyPickr"
      tagline="Find the perfect baby gear for your exact situation"
      categoryNav={
        <CategoryNav isActiveFor={isCategoryActiveForNav} onSelect={handleCategorySelect} />
      }
      filterBar={filterBar}
    >
      {category !== "strollers" ? (
        <div className="flex flex-col items-center px-4 py-16 sm:py-24">
          <div
            className="mb-6 flex h-36 w-full max-w-sm items-center justify-center rounded-3xl border border-[#388E3C]/20 bg-gradient-to-br from-[#C8E6C9] to-white text-[#388E3C]/40 shadow-inner"
            aria-hidden
          >
            <span className="text-5xl font-semibold tracking-tight text-[#388E3C]/80">Soon</span>
          </div>
          <p className="text-center text-2xl font-semibold tracking-tight text-gray-700">Coming soon</p>
          <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-[#6B7280]">
            We&apos;re expanding BabyPickr beyond strollers. Pick another tab or switch back to Strollers to
            explore picks today.
          </p>
        </div>
      ) : (
        <ResultsGrid
          results={results}
          resultsHeader={resultsHeader}
          emptyMessage="No strollers match your filters"
          onResetFilters={resetFilters}
          insertWisdomBetweenCards
          renderCard={(stroller) => (
            <ProductCard
              product={stroller}
              amazonHref={getStrollerAmazonHref(stroller)}
              hasActiveFilter={hasActiveFilter}
              summary={summaries[stroller.id]}
              isLoadingSummary={Boolean(loadingSummaries[stroller.id])}
              onRequestSummary={() => void requestSummary(stroller)}
              afterTopFeature={
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200/70">
                      {stroller.weightLbs} lbs
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200/70">
                      {stroller.foldType.replace("-", " ")} fold
                    </span>
                  </div>

                  {stroller.bestFor?.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-medium text-gray-500">Best for:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {stroller.bestFor.map((tag) => (
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

                  {stroller.worstFor?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500">Watch out:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {stroller.worstFor.map((tag) => (
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
