/** Stable 0..1 from a string — matches product pages for mock rating/review fallbacks. */
function stableUnitFromString(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

export interface RatedProduct {
  id: string;
  rating: number;
  reviewCount: number;
}

/** Effective display rating and review count (same rules as star lines on listing cards). */
export function effectiveRatingReview(p: RatedProduct): { rating: number; reviewCount: number } {
  const rating =
    p.rating > 0 ? p.rating : 4.2 + stableUnitFromString(`${p.id}:rating`) * 0.6;
  const reviewCount =
    p.reviewCount > 0
      ? p.reviewCount
      : Math.floor(150 + stableUnitFromString(`${p.id}:reviews`) * 750);
  return { rating, reviewCount };
}

/**
 * Higher = more trustworthy: rewards strong ratings more when many reviews exist,
 * and dampens very high ratings with almost no reviews vs moderate ratings with large volume.
 */
export function trustScore(p: RatedProduct): number {
  const { rating, reviewCount } = effectiveRatingReview(p);
  return rating * Math.log1p(reviewCount) + reviewCount / 1e9;
}

/** Sort descending by trust score (b before a for descending). */
export function compareRatedByTrustDesc<T extends RatedProduct>(a: T, b: T): number {
  return trustScore(b) - trustScore(a);
}
