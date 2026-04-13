"use client";

import { useEffect, useRef, useState } from "react";
import { Stroller, FilterState } from "@/types/product";
import { strollers as allStrollers } from "@/data/strollers";
import { getTag } from "@/config/affiliate";
import { buildAmazonLink } from "@/lib/affiliate";

const BUDGET_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Under $300", value: "budget" },
  { label: "$300-700", value: "mid" },
  { label: "$700+", value: "premium" },
];

const SPACE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
];

const HEIGHT_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Under 5'6\"", value: "short" },
  { label: "5'6\"-6'", value: "average" },
  { label: "Over 6'", value: "tall" },
];

const PRIORITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Most Portable", value: "portability" },
  { label: "Best Value", value: "value" },
  { label: "Car Seat Compatible", value: "carSeat" },
];

const CATEGORIES = [
  { id: "strollers", label: "Strollers" },
  { id: "car-seats", label: "Car Seats" },
  { id: "baby-monitors", label: "Baby Monitors" },
  { id: "cribs", label: "Cribs" },
  { id: "high-chairs", label: "High Chairs" },
  { id: "coming-soon", label: "Coming Soon..." },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

function getBudgetTier(price: number) {
  if (price < 300) return "budget";
  if (price <= 700) return "mid";
  return "premium";
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}

function formatReviews(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

/** Stable 0..1 from a string so mock rating/reviews match server and client. */
function stableUnitFromString(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

function getStrollerAmazonHref(stroller: Stroller): string {
  const raw = stroller.asin?.trim() ?? "";
  if (raw && raw.toLowerCase() !== "unavailable") {
    return buildAmazonLink(raw);
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(stroller.name)}&tag=${getTag()}`;
}

function getStarLine(stroller: Stroller) {
  // Fake reviews and ratings for mock data only (deterministic per id for SSR)
  const rating =
    stroller.rating > 0
      ? stroller.rating
      : 4.2 + stableUnitFromString(`${stroller.id}:rating`) * 0.6;
  const reviews =
    stroller.reviewCount > 0
      ? stroller.reviewCount
      : Math.floor(150 + stableUnitFromString(`${stroller.id}:reviews`) * 750);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-sm font-semibold text-[#92400E] ring-1 ring-[#F59E0B]/40">
        <span aria-hidden className="text-[#92400E]">
          ★
        </span>
        {rating.toFixed(1)}
      </span>
      <span className="text-sm text-[#6B7280]">{formatReviews(reviews)} reviews</span>
    </div>
  );
}

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({
    budget: "all",
    space: "all",
    parentHeight: "all",
    priority: "all",
  });

  const [category, setCategory] = useState<CategoryId>("strollers");

  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const summaryFetchAbortRef = useRef<AbortController | null>(null);

  function filterStrollers(strollers: Stroller[]): Stroller[] {
    let filtered = strollers;

    // Budget
    if (filters.budget !== "all") {
      filtered = filtered.filter((s) => getBudgetTier(s.price) === filters.budget);
    }

    // Space
    if (filters.space === "apartment") {
      filtered = filtered.filter((s) => s.apartmentFriendly === true);
    } else if (filters.space === "house") {
      filtered = filtered.filter((s) => s.apartmentFriendly === false);
    }

    // Parent height
    if (filters.parentHeight === "tall") {
      filtered = filtered.filter((s) => s.tallParentFriendly === true);
    } else if (filters.parentHeight === "short" || filters.parentHeight === "average") {
      filtered = filtered.filter((s) => !s.tallParentFriendly);
    }

    // Priority
    if (filters.priority === "carSeat") {
      filtered = filtered.filter((s) => s.carSeatCompatible);
    }

    // Sorting for priority
    if (filters.priority === "portability") {
      filtered = [...filtered].sort((a, b) => a.weightLbs - b.weightLbs);
    } else if (filters.priority === "value") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    }

    return filtered;
  }

  const results = filterStrollers(allStrollers);

  function resetFilters() {
    setFilters({ budget: "all", space: "all", parentHeight: "all", priority: "all" });
  }

  function handleFilterChange(field: keyof FilterState, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function appendSummaryFromLine(line: string, id: string) {
    if (!line) return;
    let evt: unknown;
    try {
      evt = JSON.parse(line);
    } catch {
      return;
    }
    if (
      typeof evt === "object" &&
      evt !== null &&
      (evt as { type?: string }).type === "content_block_delta" &&
      typeof (evt as { delta?: { type?: string; text?: string } }).delta === "object" &&
      (evt as { delta: { type?: string; text?: string } }).delta?.type === "text_delta" &&
      typeof (evt as { delta: { text: string } }).delta.text === "string"
    ) {
      const piece = (evt as { delta: { text: string } }).delta.text;
      setSummaries((prev) => ({ ...prev, [id]: (prev[id] ?? "") + piece }));
    }
  }

  function isAbortError(e: unknown): boolean {
    return e instanceof DOMException && e.name === "AbortError";
  }

  async function streamSummaryForStroller(
    stroller: Stroller,
    signal: AbortSignal,
  ): Promise<void> {
    const id = stroller.id;
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stroller, filters }),
        signal,
      });
      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          appendSummaryFromLine(line, id);
        }
      }
      appendSummaryFromLine(buffer, id);
    } catch (e) {
      if (isAbortError(e)) return;
      throw e;
    }
  }

  async function runSummaryBatch(controller: AbortController) {
    const currentResults = filterStrollers(allStrollers);
    if (currentResults.length === 0) {
      if (summaryFetchAbortRef.current === controller) {
        summaryFetchAbortRef.current = null;
      }
      setIsLoadingSummaries(false);
      return;
    }
    try {
      await Promise.all(
        currentResults.map((stroller) => streamSummaryForStroller(stroller, controller.signal)),
      );
    } catch {
      /* one stream failed: others may have completed; leave summaries as-is */
    } finally {
      if (summaryFetchAbortRef.current === controller) {
        summaryFetchAbortRef.current = null;
        setIsLoadingSummaries(false);
      }
    }
  }

  useEffect(() => {
    const hasActiveFilter =
      filters.budget !== "all" ||
      filters.space !== "all" ||
      filters.parentHeight !== "all" ||
      filters.priority !== "all";

    summaryFetchAbortRef.current?.abort();
    summaryFetchAbortRef.current = null;
    setSummaries({});
    setIsLoadingSummaries(false);

    if (!hasActiveFilter) return;
    if (category !== "strollers") return;

    const currentResults = filterStrollers(allStrollers);
    if (currentResults.length === 0) return;

    const controller = new AbortController();
    summaryFetchAbortRef.current = controller;
    setIsLoadingSummaries(true);
    setSummaries({});

    void runSummaryBatch(controller);

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: filters/category; filterStrollers uses current filters
  }, [filters, category]);

  async function handleLoadSummaries() {
    const currentResults = filterStrollers(allStrollers);
    if (currentResults.length === 0) return;

    summaryFetchAbortRef.current?.abort();
    const controller = new AbortController();
    summaryFetchAbortRef.current = controller;

    setIsLoadingSummaries(true);
    setSummaries({});

    await runSummaryBatch(controller);
  }

  const summaryButtonLabel = isLoadingSummaries
    ? "Refreshing..."
    : Object.keys(summaries).length > 0
      ? "✨ Refresh recommendations"
      : "✨ Explain why these fit me";

  return (
    <div
      className="min-h-screen bg-[#F0EBE1] text-gray-900 antialiased [font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif]"
    >
      <header className="relative isolate overflow-hidden border-b border-[#2B4C7E]/20 bg-[#F5EFE6]">
        <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-4 py-8 text-center sm:py-10">
          <span className="inline-flex items-center rounded-full border border-[#2B4C7E]/25 bg-white px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1A1A2E] shadow-sm sm:text-[11px]">
            Compare · shortlist · shop smarter
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1A1A2E] sm:text-4xl sm:leading-tight">
            BabyPickr
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-pretty text-sm leading-relaxed text-[#1A1A2E] sm:text-base">
            Find the perfect baby gear for your exact situation
          </p>
          <div
            className="mt-6 flex w-full max-w-[1200px] flex-wrap items-center justify-center gap-2 sm:gap-2.5"
            role="tablist"
            aria-label="Product category"
          >
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition-all duration-200 sm:px-4 sm:text-sm ${
                    isActive
                      ? "border-[#2B4C7E] bg-[#2B4C7E] text-white shadow-md shadow-[#2B4C7E]/25"
                      : "border-gray-200 bg-white text-gray-600 shadow-sm hover:border-[#2B4C7E]/40 hover:text-gray-900"
                  }`}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {category === "strollers" && (
      <section
        aria-label="Filters"
        className="sticky top-0 z-20 border-b border-[#2B4C7E]/15 bg-white/90 py-4 shadow-sm shadow-[#2B4C7E]/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80"
      >
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="rounded-2xl border border-[#2B4C7E]/15 bg-white p-4 shadow-sm sm:p-5">
            <p className="mb-4 text-center text-sm leading-relaxed text-gray-600 sm:text-left">
              Answer 4 quick questions to find your match
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-x-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Budget
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {BUDGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                        filters.budget === opt.value
                          ? "border-[#2B4C7E] bg-[#2B4C7E] text-white shadow-md shadow-[#2B4C7E]/25"
                          : "border-gray-200 bg-white text-gray-600 shadow-sm hover:border-[#2B4C7E]/40 hover:text-gray-900"
                      }`}
                      onClick={() => handleFilterChange("budget", opt.value as FilterState["budget"])}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Living space
                </span>
                <div className="flex flex-wrap gap-2">
                  {SPACE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                        filters.space === opt.value
                          ? "border-[#2B4C7E] bg-[#2B4C7E] text-white shadow-md shadow-[#2B4C7E]/25"
                          : "border-gray-200 bg-white text-gray-600 shadow-sm hover:border-[#2B4C7E]/40 hover:text-gray-900"
                      }`}
                      onClick={() => handleFilterChange("space", opt.value as FilterState["space"])}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Parent height
                </span>
                <div className="flex flex-wrap gap-2">
                  {HEIGHT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                        filters.parentHeight === opt.value
                          ? "border-[#2B4C7E] bg-[#2B4C7E] text-white shadow-md shadow-[#2B4C7E]/25"
                          : "border-gray-200 bg-white text-gray-600 shadow-sm hover:border-[#2B4C7E]/40 hover:text-gray-900"
                      }`}
                      onClick={() =>
                        handleFilterChange("parentHeight", opt.value as FilterState["parentHeight"])
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Priority
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                        filters.priority === opt.value
                          ? "border-[#2B4C7E] bg-[#2B4C7E] text-white shadow-md shadow-[#2B4C7E]/25"
                          : "border-gray-200 bg-white text-gray-600 shadow-sm hover:border-[#2B4C7E]/40 hover:text-gray-900"
                      }`}
                      onClick={() =>
                        handleFilterChange("priority", opt.value as FilterState["priority"])
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-10">
        {category !== "strollers" ? (
          <div className="flex flex-col items-center px-4 py-16 sm:py-24">
            <div
              className="mb-6 flex h-36 w-full max-w-sm items-center justify-center rounded-3xl border border-[#2B4C7E]/20 bg-gradient-to-br from-[#EEF2F8] to-white text-[#6B8F71]/40 shadow-inner"
              aria-hidden
            >
              <span className="text-5xl font-semibold tracking-tight text-[#2B4C7E]/80">Soon</span>
            </div>
            <p className="text-center text-2xl font-semibold tracking-tight text-gray-700">Coming soon</p>
            <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-gray-500">
              We&apos;re expanding BabyPickr beyond strollers. Pick another tab or switch back to Strollers to
              explore picks today.
            </p>
          </div>
        ) : (
          <>
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Results</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#1A1A2E]">
                {results.length === 1 ? "Showing 1 stroller" : `Showing ${results.length} strollers`}
              </h2>
            </div>
            <p className="max-w-md shrink-0 text-sm leading-relaxed text-gray-500">
              Refined picks that respect your space, height, and what matters most day to day.
            </p>
          </div>
          {results.length > 0 ? (
            <button
              type="button"
              disabled={isLoadingSummaries}
              onClick={() => void handleLoadSummaries()}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#2B4C7E] px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-[#244066] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:justify-start"
            >
              {summaryButtonLabel}
            </button>
          ) : null}
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-20 sm:py-28">
            <div
              className="mb-8 flex h-44 w-full max-w-md items-center justify-center rounded-3xl border border-gray-200/80 bg-gradient-to-br from-gray-100 to-gray-50 text-gray-300 shadow-inner"
              aria-hidden
            >
              <svg width="80" height="80" fill="none" viewBox="0 0 48 48" className="opacity-95">
                <circle cx="24" cy="24" r="22" fill="currentColor" />
                <ellipse cx="24" cy="28" rx="10" ry="7" fill="#fafafa" />
                <circle cx="24" cy="20" r="8" fill="#fafafa" />
                <circle cx="21" cy="19" r="1.5" fill="#d4d4d8" />
                <circle cx="27" cy="19" r="1.5" fill="#d4d4d8" />
                <path
                  d="M21 23q1.5 2 6 0"
                  stroke="#d4d4d8"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
            <p className="text-center text-2xl font-semibold tracking-tight text-gray-400">
              No strollers match your filters
            </p>
            <button
              type="button"
              className="mt-8 rounded-xl bg-gradient-to-r from-[#2B4C7E] to-[#1e3a5c] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2B4C7E]/30 transition hover:from-[#244066] hover:to-[#1a3352]"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((stroller) => (
              <article
                key={stroller.id}
                className="group flex min-h-0 min-w-0 h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ring-1 ring-[#2B4C7E]/10 transition duration-300 ease-out hover:-translate-y-1 hover:border-[#6B8F71]/40 hover:shadow-lg hover:shadow-[#2B4C7E]/10"
              >
                <div
                  className="h-1.5 w-full bg-gradient-to-r from-[#2B4C7E] via-[#6B8F71] to-[#2B4C7E]"
                  aria-hidden
                />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col px-6 pb-2 pt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                    {stroller.brand}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-gray-950">
                    {stroller.name}
                  </h3>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-[#2B4C7E]">
                    {formatPrice(stroller.price)}
                  </p>
                  {getStarLine(stroller)}

                  <div className="mt-3 min-h-[48px]">
                    {isLoadingSummaries && !(stroller.id in summaries) ? (
                      <div className="flex gap-1 items-center">
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B8F71]" />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B8F71] [animation-delay:0.1s]" />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B8F71] [animation-delay:0.2s]" />
                      </div>
                    ) : summaries[stroller.id] ? (
                      <p className="text-sm text-gray-600 leading-relaxed italic">{`"${summaries[stroller.id]}"`}</p>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <span className="inline-flex max-w-full items-start gap-1.5 rounded-full border border-[#2B4C7E]/30 bg-[#EEF2F8] px-3 py-1.5 text-xs font-medium leading-snug text-[#2B4C7E]">
                      <span aria-hidden className="mt-0.5 shrink-0 text-[#2B4C7E]">
                        ✦
                      </span>
                      <span className="min-w-0">{stroller.topFeature}</span>
                    </span>
                  </div>

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
                            className="rounded-full bg-[#EEF7EF] px-2 py-0.5 text-xs font-medium text-[#2D5A30] ring-1 ring-[#6B8F71]/30"
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
                </div>

                <div className="mt-auto border-t border-[#E8734A]/20 bg-[#FDF5F0] px-6 py-4">
                  <a
                    href={getStrollerAmazonHref(stroller)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E8734A] to-[#C85A30] py-3 text-sm font-semibold text-white shadow-md shadow-[#E8734A]/30 transition hover:from-[#D4663C] hover:to-[#B84D25] hover:shadow-lg"
                  >
                    View on Amazon →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
}