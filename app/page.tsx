"use client";

import { useState } from "react";
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
      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-semibold text-amber-900 ring-1 ring-amber-300">
        <span aria-hidden className="text-amber-600">
          ★
        </span>
        {rating.toFixed(1)}
      </span>
      <span className="text-sm text-gray-600">{formatReviews(reviews)} reviews</span>
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

  return (
    <div
      className="min-h-screen bg-green-50/80 text-gray-900 antialiased [font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif]"
    >
      <header className="relative isolate overflow-hidden border-b-2 border-green-600 bg-[#D8F3DC]">
        <div className="pointer-events-none absolute inset-0 opacity-90" aria-hidden>
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-green-400/55 blur-3xl" />
          <div className="absolute -right-16 top-8 h-80 w-80 rounded-full bg-green-300/50 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-48 w-[28rem] -translate-x-1/2 rounded-full bg-cyan-300/40 blur-3xl" />
        </div>
        <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-4 py-8 text-center sm:py-10">
          <span className="inline-flex items-center rounded-full border border-green-600/30 bg-white px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-green-900 shadow-sm sm:text-[11px]">
            Compare · shortlist · shop smarter
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl sm:leading-tight">
            BabyPickr
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-pretty text-sm leading-relaxed text-gray-600 sm:text-base">
            Find your perfect stroller in 60 seconds
          </p>
        </div>
      </header>

      <section
        aria-label="Filters"
        className="sticky top-0 z-20 border-b border-green-200 bg-white/90 py-4 shadow-sm shadow-green-900/10 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80"
      >
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="rounded-2xl border border-green-200 bg-white p-4 shadow-sm sm:p-5">
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
                          ? "border-green-600 bg-green-600 text-white shadow-md shadow-green-600/25"
                          : "border-gray-200 bg-white text-gray-600 shadow-sm hover:border-green-300 hover:text-gray-900"
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
                          ? "border-green-600 bg-green-600 text-white shadow-md shadow-green-600/25"
                          : "border-gray-200 bg-white text-gray-600 shadow-sm hover:border-green-300 hover:text-gray-900"
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
                          ? "border-green-600 bg-green-600 text-white shadow-md shadow-green-600/25"
                          : "border-gray-200 bg-white text-gray-600 shadow-sm hover:border-green-300 hover:text-gray-900"
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
                          ? "border-green-600 bg-green-600 text-white shadow-md shadow-green-600/25"
                          : "border-gray-200 bg-white text-gray-600 shadow-sm hover:border-green-300 hover:text-gray-900"
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

      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-10">
        <div className="flex flex-col gap-3 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Results</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
              {results.length === 1 ? "Showing 1 stroller" : `Showing ${results.length} strollers`}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-gray-500">
            Refined picks that respect your space, height, and what matters most day to day.
          </p>
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
              className="mt-8 rounded-xl bg-gradient-to-r from-green-600 to-green-800 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-green-700/30 transition hover:from-green-500 hover:to-green-700"
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
                className="group flex min-h-0 min-w-0 h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ring-1 ring-green-600/10 transition duration-300 ease-out hover:-translate-y-1 hover:border-green-300 hover:shadow-lg hover:shadow-green-900/10"
              >
                <div
                  className="h-1.5 w-full bg-gradient-to-r from-green-500 via-green-400 to-cyan-500"
                  aria-hidden
                />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col px-6 pb-2 pt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                    {stroller.brand}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-gray-950">
                    {stroller.name}
                  </h3>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-green-700">
                    {formatPrice(stroller.price)}
                  </p>
                  {getStarLine(stroller)}

                  <div className="mt-5">
                    <span className="inline-flex max-w-full items-start gap-1.5 rounded-full border border-green-300 bg-green-100 px-3 py-1.5 text-xs font-medium leading-snug text-green-900">
                      <span aria-hidden className="mt-0.5 shrink-0 text-green-600">
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
                            className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 ring-1 ring-green-200"
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

                <div className="mt-auto border-t border-green-100 bg-green-50 px-6 py-4">
                  <a
                    href={getStrollerAmazonHref(stroller)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-800 py-3 text-sm font-semibold text-white shadow-md shadow-green-700/25 transition hover:from-green-500 hover:to-green-700 hover:shadow-lg"
                  >
                    View on Amazon →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}