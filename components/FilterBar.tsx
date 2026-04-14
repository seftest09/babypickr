"use client";

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

export function FilterBar({
  subtitle,
  filterGroups,
  values,
  onChange,
  gridClassName = defaultGrid,
}: FilterBarProps) {
  return (
    <section
      aria-label="Filters"
      className="sticky top-0 z-20 border-b border-[#2B4C7E]/15 bg-white/90 py-4 shadow-sm shadow-[#2B4C7E]/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="rounded-2xl border border-[#2B4C7E]/15 bg-white p-4 shadow-sm sm:p-5">
          <p className="mb-4 text-center text-sm leading-relaxed text-gray-600 sm:text-left">{subtitle}</p>
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
    </section>
  );
}
