"use client";

import { useCallback, useMemo, useState } from "react";

export type FilterOption = { label: string; value: string };

export type FilterGroup = {
  key: string;
  label: string;
  options: readonly FilterOption[];
  /** Tailwind classes for the option button row (default matches most stroller groups) */
  optionWrapClassName?: string;
};

export type FilterBarProps = {
  subtitle: string;
  filterGroups: readonly FilterGroup[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  /** Tailwind grid columns for the filter row (default matches strollers) */
  gridClassName?: string;
};

const defaultGrid =
  "grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-x-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]";

function countActiveFilters(filterGroups: readonly FilterGroup[], values: Record<string, string>): number {
  return filterGroups.reduce((n, g) => (values[g.key] !== "all" ? n + 1 : n), 0);
}

function prioritySortLabel(filterGroups: readonly FilterGroup[], values: Record<string, string>): string {
  const priorityGroup = filterGroups.find((g) => g.key === "priority");
  if (!priorityGroup) return "Sort";
  const v = values.priority;
  if (!v || v === "all") return "Sort";
  const opt = priorityGroup.options.find((o) => o.value === v);
  return opt?.label ?? "Sort";
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

export function FilterBar({
  subtitle,
  filterGroups,
  values,
  onChange,
  gridClassName = defaultGrid,
}: FilterBarProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const activeFilterCount = useMemo(
    () => countActiveFilters(filterGroups, values),
    [filterGroups, values],
  );

  const sortIndicator = useMemo(
    () => prioritySortLabel(filterGroups, values),
    [filterGroups, values],
  );

  const toggleMobilePanel = useCallback(() => {
    setMobileExpanded((open) => !open);
  }, []);

  const filtersButtonLabel =
    activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters";

  return (
    <section
      aria-label="Filters"
      className="relative z-20 border-b border-[#2B4C7E]/15 bg-white/90 py-4 shadow-sm shadow-[#2B4C7E]/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 md:sticky md:top-0"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="rounded-2xl border border-[#2B4C7E]/15 bg-white p-4 shadow-sm sm:p-5">
          {/* Mobile: single control row (hidden on md+) */}
          <div className="flex items-center justify-between gap-3 md:hidden">
            <button
              type="button"
              aria-expanded={mobileExpanded}
              aria-controls="filter-bar-panel"
              className="inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-[#2B4C7E]/25 bg-[#F5EFE6] px-3 py-2.5 text-sm font-semibold text-[#1A1A2E] shadow-sm transition-colors hover:border-[#2B4C7E]/50 hover:bg-white"
              onClick={toggleMobilePanel}
            >
              <FilterIcon className="shrink-0 text-[#2B4C7E]" />
              <span className="truncate">{filtersButtonLabel}</span>
            </button>
            <div
              className="shrink-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-center text-xs font-semibold text-gray-700"
              title="Current priority / sort"
            >
              {sortIndicator === "Sort" ? (
                <span className="text-gray-500">Sort</span>
              ) : (
                <span className="max-w-[9rem] truncate">{sortIndicator}</span>
              )}
            </div>
          </div>

          {/* Panel: collapsed+hidden on small screens; always visible md+ */}
          <div
            id="filter-bar-panel"
            className={
              mobileExpanded
                ? "mt-4 block md:mt-0"
                : "mt-4 hidden md:mt-0 md:block"
            }
          >
            <p className="mb-4 text-center text-sm leading-relaxed text-gray-600 sm:text-left md:mb-4">
              {subtitle}
            </p>
            <div className={gridClassName}>
              {filterGroups.map((group) => (
                <div key={group.key} className="flex min-w-0 flex-col gap-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    {group.label}
                  </span>
                  <div className={group.optionWrapClassName ?? "flex flex-wrap gap-2"}>
                    {group.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                          values[group.key] === opt.value
                            ? "border-[#2B4C7E] bg-[#2B4C7E] text-white shadow-md shadow-[#2B4C7E]/25"
                            : "border-gray-200 bg-white text-gray-600 shadow-sm hover:border-[#2B4C7E]/40 hover:text-gray-900"
                        }`}
                        onClick={() => onChange(group.key, opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
