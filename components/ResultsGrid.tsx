"use client";

import { Fragment, type ReactNode } from "react";

export type ResultsGridProps<T> = {
  results: readonly T[];
  renderCard: (item: T) => ReactNode;
  resultsHeader: ReactNode;
  emptyMessage: string;
  onResetFilters?: () => void;
};

export function ResultsGrid<T>({
  results,
  renderCard,
  resultsHeader,
  emptyMessage,
  onResetFilters,
}: ResultsGridProps<T>) {
  return (
    <>
      {resultsHeader}

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
              <path d="M21 23q1.5 2 6 0" stroke="#d4d4d8" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <p className="text-center text-2xl font-semibold tracking-tight text-gray-400">{emptyMessage}</p>
          {onResetFilters && (
            <button
              type="button"
              className="mt-8 rounded-xl bg-gradient-to-r from-[#C4567E] to-[#9B6BA8] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#C4567E]/30 transition hover:from-[#b04a6f] hover:to-[#8a5a96]"
              onClick={onResetFilters}
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <Fragment key={(item as { id: string }).id}>{renderCard(item)}</Fragment>
          ))}
        </div>
      )}
    </>
  );
}
