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
import type { Crib, CribFilterState, MaterialType } from "@/types/product";
import { cribs as allCribs } from "@/data/cribs";
import { getTag } from "@/config/affiliate";
import { buildAmazonLink } from "@/lib/affiliate";
import { filterCribs } from "@/lib/filters/cribs";

const BUDGET_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Under $250", value: "budget" },
  { label: "$250-500", value: "mid" },
  { label: "$500+", value: "premium" },
] as const;

const CONVERTIBLE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Yes converts", value: "yes" },
  { label: "No", value: "no" },
] as const;

const MATERIAL_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Solid Wood", value: "solid-wood" },
  { label: "Engineered Wood", value: "engineered-wood" },
  { label: "Metal", value: "metal" },
] as const;

const PRIORITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Best Value", value: "value" },
  { label: "Top Rated", value: "top-rated" },
  { label: "Apartment Friendly", value: "compact" },
] as const;

const CRIB_FILTER_GROUPS: readonly FilterGroup[] = [
  {
    key: "budget",
    label: "Budget",
    options: BUDGET_OPTIONS,
    optionWrapClassName: "flex flex-wrap gap-1.5 sm:gap-2",
  },
  { key: "convertible", label: "Convertible", options: CONVERTIBLE_OPTIONS },
  { key: "material", label: "Material", options: MATERIAL_OPTIONS },
  { key: "priority", label: "Priority", options: PRIORITY_OPTIONS },
];

const CRIB_FILTER_GRID =
  "grid grid-cols-2 gap-x-8 gap-y-6 sm:gap-x-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]";

function getCribAmazonHref(crib: Crib): string {
  const raw = crib.asin?.trim() ?? "";
  if (raw && raw.toLowerCase() !== "unavailable") {
    return buildAmazonLink(raw);
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(crib.name)}&tag=${getTag()}`;
}

function materialLabel(m: MaterialType): string {
  if (m === "solid-wood") return "Solid wood";
  if (m === "engineered-wood") return "Engineered wood";
  return "Metal";
}

function assemblyLabel(a: Crib["assemblyDifficulty"]): string {
  if (a === "easy") return "Assembly: easy";
  if (a === "moderate") return "Assembly: moderate";
  return "Assembly: harder";
}

export default function CribsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<CribFilterState>({
    budget: "all",
    convertible: "all",
    material: "all",
    priority: "all",
  });
  const [category, setCategory] = useState<CategoryId>("cribs");

  const results = useMemo(() => filterCribs(allCribs, filters), [filters]);

  const { summaries, loadingSummaries, requestSummary } = useProductAiSummary(filters, "crib");

  const hasActiveFilter =
    filters.budget !== "all" ||
    filters.convertible !== "all" ||
    filters.material !== "all" ||
    filters.priority !== "all";

  const filterValues = useMemo(
    () => ({
      budget: filters.budget,
      convertible: filters.convertible,
      material: filters.material,
      priority: filters.priority,
    }),
    [filters],
  );

  function resetFilters() {
    setFilters({ budget: "all", convertible: "all", material: "all", priority: "all" });
  }

  function handleFilterBarChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value } as CribFilterState));
  }

  function handleCategorySelect(id: CategoryId) {
    if (id === "cribs") {
      setCategory("cribs");
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
    return id === "cribs" ? category === "cribs" : category === id;
  }

  const filterBar =
    category === "cribs" ? (
      <FilterBar
        subtitle="Answer 4 quick questions to find your match"
        filterGroups={CRIB_FILTER_GROUPS}
        values={filterValues}
        gridClassName={CRIB_FILTER_GRID}
        onChange={handleFilterBarChange}
      />
    ) : null;

  const resultsHeader = (
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Results</p>
          <h2 className="font-dm-serif-display mt-1 text-2xl font-semibold tracking-tight text-[#1A1A2E]">
            {results.length === 1 ? "Showing 1 crib" : `Showing ${results.length} cribs`}
          </h2>
        </div>
        <p className="max-w-md shrink-0 text-sm leading-relaxed text-[#6B7280]">
          Find the perfect crib for your nursery. Matched to your nursery size and style — filter by budget,
          material, and convertibility.
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
      {category !== "cribs" ? (
        <div className="flex flex-col items-center px-4 py-16 sm:py-24">
          <div
            className="mb-6 flex h-36 w-full max-w-sm items-center justify-center rounded-3xl border border-[#388E3C]/20 bg-gradient-to-br from-[#C8E6C9] to-white text-[#388E3C]/40 shadow-inner"
            aria-hidden
          >
            <span className="text-5xl font-semibold tracking-tight text-[#388E3C]/80">Soon</span>
          </div>
          <p className="text-center text-2xl font-semibold tracking-tight text-gray-700">Coming soon</p>
          <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-[#6B7280]">
            We&apos;re expanding BabyPickr beyond cribs. Pick another tab or switch back to Cribs to explore
            picks today.
          </p>
        </div>
      ) : (
        <ResultsGrid
          results={results}
          resultsHeader={resultsHeader}
          emptyMessage="No cribs match your filters"
          onResetFilters={resetFilters}
          renderCard={(crib) => (
            <ProductCard
              product={crib}
              amazonHref={getCribAmazonHref(crib)}
              hasActiveFilter={hasActiveFilter}
              summary={summaries[crib.id]}
              isLoadingSummary={Boolean(loadingSummaries[crib.id])}
              onRequestSummary={() => void requestSummary(crib)}
              afterStars={
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-black/5">
                    {materialLabel(crib.materialType)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/5 ${
                      crib.convertible ? "bg-teal-100 text-teal-900" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {crib.convertible ? "Convertible" : "Fixed stage"}
                  </span>
                  {crib.apartmentFriendly && (
                    <span className="rounded-full bg-[#F3E5F5] px-3 py-1 text-xs font-semibold text-[#5B3D66] ring-1 ring-[#9B6BA8]/35">
                      Apartment friendly
                    </span>
                  )}
                </div>
              }
              afterTopFeature={
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200/70">
                      {assemblyLabel(crib.assemblyDifficulty)}
                    </span>
                  </div>

                  {crib.bestFor?.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-medium text-gray-500">Best for:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {crib.bestFor.map((tag) => (
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

                  {crib.worstFor?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500">Watch out:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {crib.worstFor.slice(0, 2).map((tag) => (
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
