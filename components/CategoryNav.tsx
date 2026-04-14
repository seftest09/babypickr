"use client";

import type { CategoryId } from "@/lib/categories";
import { CATEGORIES } from "@/lib/categories";

export type CategoryNavProps = {
  isActiveFor: (catId: CategoryId) => boolean;
  onSelect: (catId: CategoryId) => void;
};

export function CategoryNav({ isActiveFor, onSelect }: CategoryNavProps) {
  return (
    <div
      className="mt-6 flex w-full max-w-[1400px] flex-wrap items-center justify-center gap-2 sm:gap-2.5"
      role="tablist"
      aria-label="Product category"
    >
      {CATEGORIES.map((cat) => {
        const isActive = isActiveFor(cat.id);
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`rounded-full border px-3 py-2 text-xs font-semibold transition-all duration-200 sm:px-4 sm:text-sm ${
              isActive
                ? "border-[#C4567E] bg-[#C4567E] text-white shadow-md shadow-[#C4567E]/25"
                : "border-gray-200 bg-white text-gray-600 shadow-sm hover:border-[#C4567E]/40 hover:text-gray-900"
            }`}
            onClick={() => onSelect(cat.id)}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
