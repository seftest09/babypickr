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
import type { BabyMonitor, MonitorFilterState, VideoQuality } from "@/types/product";
import { monitors as allMonitors } from "@/data/monitors";
import { getTag } from "@/config/affiliate";
import { buildAmazonLink } from "@/lib/affiliate";
import { filterMonitors } from "@/lib/filters/monitors";
import {
  applyJourneySituationsToMonitorFilters,
  clearJourneyStorage,
  journeyExplanationsForCategory,
  journeyTypeLabel,
  readJourneyFromStorage,
  situationLabels,
  type JourneyStored,
} from "@/lib/journeyStorage";

const BUDGET_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Under $150", value: "budget" },
  { label: "$150-300", value: "mid" },
  { label: "$300+", value: "premium" },
] as const;

const CONNECTIVITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "WiFi", value: "wifi" },
  { label: "No WiFi Needed", value: "non-wifi" },
] as const;

const VIDEO_QUALITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Audio Only", value: "audio-only" },
  { label: "Standard", value: "standard" },
  { label: "HD", value: "hd" },
] as const;

const PRIORITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Top Safety", value: "safety" },
  { label: "Best Value", value: "value" },
  { label: "Long Battery", value: "battery" },
] as const;

const MONITOR_FILTER_GROUPS: readonly FilterGroup[] = [
  {
    key: "budget",
    label: "Budget",
    options: BUDGET_OPTIONS,
    optionWrapClassName: "flex flex-wrap gap-1.5 sm:gap-2",
  },
  { key: "connectivity", label: "Connectivity", options: CONNECTIVITY_OPTIONS },
  { key: "videoQuality", label: "Video Quality", options: VIDEO_QUALITY_OPTIONS },
  { key: "priority", label: "Priority", options: PRIORITY_OPTIONS },
];

const MONITOR_FILTER_GRID =
  "grid grid-cols-2 gap-x-8 gap-y-6 sm:gap-x-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]";

function getMonitorAmazonHref(monitor: BabyMonitor): string {
  const raw = monitor.asin?.trim() ?? "";
  if (raw && raw.toLowerCase() !== "unavailable") {
    return buildAmazonLink(raw);
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(monitor.name)}&tag=${getTag()}`;
}

function videoQualityLabel(q: VideoQuality): string {
  if (q === "audio-only") return "Audio only";
  if (q === "720p") return "720p";
  if (q === "1080p") return "1080p";
  if (q === "2K") return "2K";
  return "4K";
}

function rangeLabel(r: BabyMonitor["range"]): string {
  if (r === "short") return "Shorter range";
  if (r === "medium") return "Medium range";
  return "Long range";
}

function batteryLabel(b: BabyMonitor["batteryLife"]): string {
  if (b === "no-battery") return "Plug-in / AC";
  if (b === "under-8hrs") return "Under 8 hrs portable";
  if (b === "8-12hrs") return "8–12 hrs portable";
  return "12+ hrs portable";
}

export default function MonitorsPage() {
  const router = useRouter();
  const [journey, setJourney] = useState<JourneyStored | null>(null);
  const [filters, setFilters] = useState<MonitorFilterState>({
    budget: "all",
    connectivity: "all",
    videoQuality: "all",
    priority: "all",
  });
  const [category, setCategory] = useState<CategoryId>("baby-monitors");

  useEffect(() => {
    const j = readJourneyFromStorage();
    if (!j) {
      router.replace("/?returnTo=/monitors");
      return;
    }
    setJourney(j);
    setFilters((prev) => applyJourneySituationsToMonitorFilters(j.situations, j.journeyType, prev));
  }, [router]);

  const startJourneyOver = () => {
    clearJourneyStorage();
    router.replace("/");
  };

  const results = useMemo(
    () =>
      journey
        ? filterMonitors(allMonitors, filters, {
            journeyType: journey.journeyType,
            situations: journey.situations,
          })
        : filterMonitors(allMonitors, filters),
    [filters, journey],
  );

  const { summaries, loadingSummaries, requestSummary } = useProductAiSummary(filters, "baby monitor");

  const hasActiveFilter =
    filters.budget !== "all" ||
    filters.connectivity !== "all" ||
    filters.videoQuality !== "all" ||
    filters.priority !== "all";

  const filterValues = useMemo(
    () => ({
      budget: filters.budget,
      connectivity: filters.connectivity,
      videoQuality: filters.videoQuality,
      priority: filters.priority,
    }),
    [filters],
  );

  function resetFilters() {
    setFilters({ budget: "all", connectivity: "all", videoQuality: "all", priority: "all" });
  }

  function handleFilterBarChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value } as MonitorFilterState));
  }

  function handleCategorySelect(id: CategoryId) {
    if (id === "baby-monitors") {
      setCategory("baby-monitors");
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
    if (id === "cribs" || id === "high-chairs") return false;
    return id === "baby-monitors" ? category === "baby-monitors" : category === id;
  }

  const filterBar =
    category === "baby-monitors" ? (
      <FilterBar
        subtitle="Answer 4 quick questions to find your match"
        filterGroups={MONITOR_FILTER_GROUPS}
        values={filterValues}
        gridClassName={MONITOR_FILTER_GRID}
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
                {journeyExplanationsForCategory("baby-monitors", journey)
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
            {results.length === 1 ? "Showing 1 baby monitor" : `Showing ${results.length} baby monitors`}
          </h2>
        </div>
        <p className="max-w-md shrink-0 text-sm leading-relaxed text-[#6B7280]">
          Matched to your home setup and monitoring needs
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
      {category !== "baby-monitors" ? (
        <div className="flex flex-col items-center px-4 py-16 sm:py-24">
          <div
            className="mb-6 flex h-36 w-full max-w-sm items-center justify-center rounded-3xl border border-[#388E3C]/20 bg-gradient-to-br from-[#C8E6C9] to-white text-[#388E3C]/40 shadow-inner"
            aria-hidden
          >
            <span className="text-5xl font-semibold tracking-tight text-[#388E3C]/80">Soon</span>
          </div>
          <p className="text-center text-2xl font-semibold tracking-tight text-gray-700">Coming soon</p>
          <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-[#6B7280]">
            We&apos;re expanding BabyPickr beyond baby monitors. Pick another tab or switch back to Baby
            Monitors to explore picks today.
          </p>
        </div>
      ) : (
        <ResultsGrid
          results={results}
          resultsHeader={resultsHeader}
          emptyMessage="No baby monitors match your filters"
          onResetFilters={resetFilters}
          renderCard={(monitor) => (
            <ProductCard
              product={monitor}
              amazonHref={getMonitorAmazonHref(monitor)}
              hasActiveFilter={hasActiveFilter}
              summary={summaries[monitor.id]}
              isLoadingSummary={Boolean(loadingSummaries[monitor.id])}
              onRequestSummary={() => void requestSummary(monitor)}
              afterStars={
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-black/5">
                    {videoQualityLabel(monitor.videoQuality)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/5 ${
                      monitor.wifiRequired
                        ? "bg-sky-100 text-sky-900"
                        : "bg-emerald-100 text-emerald-900"
                    }`}
                  >
                    {monitor.wifiRequired ? "WiFi" : "No WiFi"}
                  </span>
                  {monitor.hasAppControl && (
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900 ring-1 ring-black/5">
                      App
                    </span>
                  )}
                </div>
              }
              afterTopFeature={
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200/70">
                      {batteryLabel(monitor.batteryLife)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200/70">
                      {rangeLabel(monitor.range)}
                    </span>
                  </div>

                  {monitor.bestFor?.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-medium text-gray-500">Best for:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {monitor.bestFor.map((tag) => (
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

                  {monitor.worstFor?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500">Watch out:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {monitor.worstFor.slice(0, 2).map((tag) => (
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
