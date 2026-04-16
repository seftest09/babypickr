"use client";

import { useMemo, useState } from "react";
import { useProductAiSummary } from "@/hooks/useProductAiSummary";
import { useRouter } from "next/navigation";
import { CategoryNav } from "@/components/CategoryNav";
import { CategoryPageLayout } from "@/components/CategoryPageLayout";
import { FilterBar, type FilterGroup } from "@/components/FilterBar";
import { ProductCard } from "@/components/ProductCard";
import { ResultsGrid } from "@/components/ResultsGrid";
import type { CategoryId } from "@/lib/categories";
import { CATEGORY_HREFS } from "@/lib/categories";
import type { ChairType, HighChair, HighChairFilterState } from "@/types/product";
import { highChairs as allHighChairs } from "@/data/high-chairs";
import { getTag } from "@/config/affiliate";
import { buildAmazonLink } from "@/lib/affiliate";
import { filterHighChairs } from "@/lib/filters/highChairs";

const BUDGET_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Under $100", value: "budget" },
  { label: "$100-200", value: "mid" },
  { label: "$200+", value: "premium" },
] as const;

const CHAIR_TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Full Size", value: "full-size" },
  { label: "Compact", value: "compact" },
  { label: "Booster", value: "booster" },
  { label: "Hook-On", value: "hook-on" },
] as const;

const SPACE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
] as const;

const PRIORITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Easiest to Clean", value: "easiest-clean" },
  { label: "Best Value", value: "value" },
  { label: "Top Rated", value: "top-rated" },
] as const;

const HIGH_CHAIR_FILTER_GROUPS: readonly FilterGroup[] = [
  {
    key: "budget",
    label: "Budget",
    options: BUDGET_OPTIONS,
    optionWrapClassName: "flex flex-wrap gap-1.5 sm:gap-2",
  },
  { key: "chairType", label: "Chair Type", options: CHAIR_TYPE_OPTIONS },
  { key: "space", label: "Space", options: SPACE_OPTIONS },
  { key: "priority", label: "Priority", options: PRIORITY_OPTIONS },
];

const HIGH_CHAIR_FILTER_GRID =
  "grid grid-cols-2 gap-x-8 gap-y-6 sm:gap-x-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]";

function getHighChairAmazonHref(chair: HighChair): string {
  const raw = chair.asin?.trim() ?? "";
  if (raw && raw.toLowerCase() !== "unavailable") {
    return buildAmazonLink(raw);
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(chair.name)}&tag=${getTag()}`;
}

function chairTypeLabel(t: ChairType): string {
  if (t === "full-size") return "Full size";
  if (t === "compact") return "Compact";
  if (t === "booster") return "Booster";
  return "Hook-on";
}

export default function HighChairsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<HighChairFilterState>({
    budget: "all",
    chairType: "all",
    space: "all",
    priority: "all",
  });
  const [category, setCategory] = useState<CategoryId>("high-chairs");

  const results = useMemo(() => filterHighChairs(allHighChairs, filters), [filters]);

  const { summaries, loadingSummaries, requestSummary } = useProductAiSummary(filters, "high chair");

  const hasActiveFilter =
    filters.budget !== "all" ||
    filters.chairType !== "all" ||
    filters.space !== "all" ||
    filters.priority !== "all";

  const filterValues = useMemo(
    () => ({
      budget: filters.budget,
      chairType: filters.chairType,
      space: filters.space,
      priority: filters.priority,
    }),
    [filters],
  );

  function resetFilters() {
    setFilters({ budget: "all", chairType: "all", space: "all", priority: "all" });
  }

  function handleFilterBarChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value } as HighChairFilterState));
  }

  function handleCategorySelect(id: CategoryId) {
    if (id === "high-chairs") {
      setCategory("high-chairs");
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
    return id === "high-chairs" ? category === "high-chairs" : category === id;
  }

  const filterBar =
    category === "high-chairs" ? (
      <FilterBar
        subtitle="Answer 4 quick questions to find your match"
        filterGroups={HIGH_CHAIR_FILTER_GROUPS}
        values={filterValues}
        gridClassName={HIGH_CHAIR_FILTER_GRID}
        onChange={handleFilterBarChange}
      />
    ) : null;

  const resultsHeader = (
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Results</p>
          <h2 className="font-dm-serif-display mt-1 text-2xl font-semibold tracking-tight text-[#1A1A2E]">
            {results.length === 1 ? "Showing 1 high chair" : `Showing ${results.length} high chairs`}
          </h2>
        </div>
        <p className="max-w-md shrink-0 text-sm leading-relaxed text-[#6B7280]">
          Find the right high chair for your family. Matched to your home and feeding needs — filter by budget,
          type, and your space.
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
      {category !== "high-chairs" ? (
        <div className="flex flex-col items-center px-4 py-16 sm:py-24">
          <div
            className="mb-6 flex h-36 w-full max-w-sm items-center justify-center rounded-3xl border border-[#388E3C]/20 bg-gradient-to-br from-[#C8E6C9] to-white text-[#388E3C]/40 shadow-inner"
            aria-hidden
          >
            <span className="text-5xl font-semibold tracking-tight text-[#388E3C]/80">Soon</span>
          </div>
          <p className="text-center text-2xl font-semibold tracking-tight text-gray-700">Coming soon</p>
          <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-[#6B7280]">
            We&apos;re expanding BabyPickr beyond high chairs. Pick another tab or switch back to High Chairs
            to explore picks today.
          </p>
        </div>
      ) : (
        <ResultsGrid
          results={results}
          resultsHeader={resultsHeader}
          emptyMessage="No high chairs match your filters"
          onResetFilters={resetFilters}
          renderCard={(chair) => (
            <ProductCard
              product={chair}
              amazonHref={getHighChairAmazonHref(chair)}
              hasActiveFilter={hasActiveFilter}
              summary={summaries[chair.id]}
              isLoadingSummary={Boolean(loadingSummaries[chair.id])}
              onRequestSummary={() => void requestSummary(chair)}
              afterStars={
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-900 ring-1 ring-black/5">
                    {chairTypeLabel(chair.chairType)}
                  </span>
                  {chair.reclines && (
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900 ring-1 ring-black/5">
                      Reclines
                    </span>
                  )}
                  {chair.foldable && (
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900 ring-1 ring-black/5">
                      Folds
                    </span>
                  )}
                  {chair.easyToClean && (
                    <span className="rounded-full bg-[#FFFDE7] px-3 py-1 text-xs font-semibold text-[#7A5F08] ring-1 ring-[#D4A017]/35">
                      Easy clean
                    </span>
                  )}
                </div>
              }
              afterTopFeature={
                <>
                  {chair.apartmentFriendly && (
                    <div className="mt-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200/70">
                        Apartment friendly
                      </span>
                    </div>
                  )}

                  {chair.bestFor?.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-medium text-gray-500">Best for:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {chair.bestFor.map((tag) => (
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

                  {chair.worstFor?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500">Watch out:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {chair.worstFor.slice(0, 2).map((tag) => (
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
