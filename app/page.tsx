"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryNav } from "@/components/CategoryNav";
import { CategoryPageLayout } from "@/components/CategoryPageLayout";
import { FilterBar, type FilterGroup } from "@/components/FilterBar";
import { ProductCard } from "@/components/ProductCard";
import { ResultsGrid } from "@/components/ResultsGrid";
import type { CategoryId } from "@/lib/categories";
import { CATEGORY_HREFS } from "@/lib/categories";
import { Stroller, FilterState } from "@/types/product";
import { strollers as allStrollers } from "@/data/strollers";
import { getTag } from "@/config/affiliate";
import { buildAmazonLink } from "@/lib/affiliate";
import { filterStrollers } from "@/lib/filters/strollers";
import { useProductAiSummary } from "@/hooks/useProductAiSummary";

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

export default function Home() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    budget: "all",
    space: "all",
    parentHeight: "all",
    priority: "all",
  });

  const [category, setCategory] = useState<CategoryId>("strollers");

  const { summaries, loadingSummaries, requestSummary } = useProductAiSummary(filters, "stroller");

  const results = useMemo(() => filterStrollers(allStrollers, filters), [filters]);

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

  function resetFilters() {
    setFilters({ budget: "all", space: "all", parentHeight: "all", priority: "all" });
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

  const resultsHeader = (
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8B5E72]">Results</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#3D1C2E]">
            {results.length === 1 ? "Showing 1 stroller" : `Showing ${results.length} strollers`}
          </h2>
        </div>
        <p className="max-w-md shrink-0 text-sm leading-relaxed text-gray-500">
          Refined picks that respect your space, height, and what matters most day to day.
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
      {category !== "strollers" ? (
        <div className="flex flex-col items-center px-4 py-16 sm:py-24">
          <div
            className="mb-6 flex h-36 w-full max-w-sm items-center justify-center rounded-3xl border border-[#C4567E]/20 bg-gradient-to-br from-[#FDE8F2] to-white text-[#9B6BA8]/40 shadow-inner"
            aria-hidden
          >
            <span className="text-5xl font-semibold tracking-tight text-[#C4567E]/80">Soon</span>
          </div>
          <p className="text-center text-2xl font-semibold tracking-tight text-gray-700">Coming soon</p>
          <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-gray-500">
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
                            className="rounded-full bg-[#F0E8F8] px-2 py-0.5 text-xs font-medium text-[#6B4A8B] ring-1 ring-[#9B6BA8]/30"
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
