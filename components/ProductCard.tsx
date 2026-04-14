"use client";

import type { ReactNode } from "react";

export type ProductCardProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  topFeature: string;
  bestFor?: string[];
  worstFor?: string[];
  rating: number;
  reviewCount: number;
};

function stableUnitFromString(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}

function formatReviews(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function StarLine({ product }: { product: ProductCardProduct }) {
  const rating =
    product.rating > 0 ? product.rating : 4.2 + stableUnitFromString(`${product.id}:rating`) * 0.6;
  const reviews =
    product.reviewCount > 0
      ? product.reviewCount
      : Math.floor(150 + stableUnitFromString(`${product.id}:reviews`) * 750);
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

export type ProductCardProps = {
  product: ProductCardProduct;
  amazonHref: string;
  hasActiveFilter: boolean;
  summary?: string;
  isLoadingSummary: boolean;
  onRequestSummary: () => void;
  /** Rendered after the star line, before the top-feature badge (e.g. car seat type row) */
  afterStars?: ReactNode;
  /** Rendered after the top-feature badge (e.g. spec chips and best/worst lists) */
  afterTopFeature: ReactNode;
};

export function ProductCard({
  product,
  amazonHref,
  hasActiveFilter,
  summary,
  isLoadingSummary,
  onRequestSummary,
  afterStars,
  afterTopFeature,
}: ProductCardProps) {
  const hasSummary = Boolean(summary);

  return (
    <article className="group flex min-h-0 min-w-0 h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ring-1 ring-[#C4567E]/10 transition duration-300 ease-out hover:-translate-y-1 hover:border-[#9B6BA8]/40 hover:shadow-lg hover:shadow-[#C4567E]/10">
      <div
        className="h-1.5 w-full bg-gradient-to-r from-[#C4567E] via-[#9B6BA8] to-[#C4567E]"
        aria-hidden
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col px-6 pb-2 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
          {product.brand}
        </p>
        <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-gray-950">
          {product.name}
        </h3>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-[#C4567E]">
          {formatPrice(product.price)}
        </p>
        <StarLine product={product} />
        {afterStars}

        <div className="mt-5">
          <span className="inline-flex max-w-full items-start gap-1.5 rounded-full border border-[#C4567E]/30 bg-[#FDE8F2] px-3 py-1.5 text-xs font-medium leading-snug text-[#C4567E]">
            <span aria-hidden className="mt-0.5 shrink-0 text-[#C4567E]">
              ✦
            </span>
            <span className="min-w-0">{product.topFeature}</span>
          </span>
        </div>

        {afterTopFeature}
      </div>

      <div className="mt-auto border-t border-[#F5A623]/25 bg-[#FDE8F2] px-6 py-4">
        {hasActiveFilter &&
          (!hasSummary ? (
            <button
              type="button"
              onClick={() => void onRequestSummary()}
              disabled={isLoadingSummary}
              className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#C4567E]/30 px-3 py-1.5 text-xs font-medium text-[#C4567E] transition hover:bg-[#FDE8F2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingSummary ? "Thinking..." : "✨ Why does this fit me?"}
            </button>
          ) : (
            <p className="mb-2 mt-2 border-l-2 border-[#C4567E]/30 pl-3 text-xs leading-relaxed text-gray-600 italic">
              {summary}
            </p>
          ))}
        <a
          href={amazonHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A83060] to-[#8B2450] py-3 text-sm font-semibold text-white shadow-md shadow-[#A83060]/30 transition hover:from-[#C4567E] hover:to-[#A83060] hover:shadow-lg"
        >
          View on Amazon →
        </a>
      </div>
    </article>
  );
}
