"use client";

import { Fragment, type ReactNode } from "react";

const BETWEEN_CARD_WISDOM = [
  `"In simplicity lies the highest sophistication." — Leonardo da Vinci`,
  `"The middle path holds the most wisdom." — Buddha`,
  `"That which is measured improves." — Ancient proverb`,
  `"Buy less, choose well." — Vivienne Westwood`,
  `"The best things in life are not things." — Art Buchwald`,
] as const;

export type ResultsGridProps<T> = {
  results: readonly T[];
  renderCard: (item: T) => ReactNode;
  resultsHeader: ReactNode;
  emptyMessage: string;
  onResetFilters?: () => void;
  /** Insert subtle italic wisdom lines after every 3rd product card (strollers homepage). */
  insertWisdomBetweenCards?: boolean;
};

export function ResultsGrid<T>({
  results,
  renderCard,
  resultsHeader,
  emptyMessage,
  onResetFilters,
  insertWisdomBetweenCards = false,
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
              className="mt-8 rounded-xl bg-[#2D6A4F] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2D6A4F]/30 transition hover:bg-[#1B4332]"
              onClick={onResetFilters}
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.flatMap((item, index) => {
            const id = (item as { id: string }).id;
            const row = [
              <Fragment key={id}>{renderCard(item)}</Fragment>,
            ];
            if (
              insertWisdomBetweenCards &&
              (index + 1) % 3 === 0 &&
              index < results.length - 1
            ) {
              const q = BETWEEN_CARD_WISDOM[Math.floor((index + 1) / 3 - 1) % BETWEEN_CARD_WISDOM.length];
              row.push(
                <p
                  key={`wisdom-${id}`}
                  className="font-dm-serif-display col-span-full px-2 py-1 pb-2.5 text-center text-xs italic text-[#9B9B9B]"
                >
                  {q}
                </p>,
              );
            }
            return row;
          })}
        </div>
      )}
    </>
  );
}
