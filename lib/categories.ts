export const CATEGORIES = [
  { id: "strollers", label: "Strollers" },
  { id: "car-seats", label: "Car Seats" },
  { id: "baby-monitors", label: "Baby Monitors" },
  { id: "cribs", label: "Cribs" },
  { id: "high-chairs", label: "High Chairs" },
  { id: "coming-soon", label: "Coming Soon..." },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

/** App Router paths for category tabs that have a listing page */
export const CATEGORY_HREFS: Partial<Record<CategoryId, string>> = {
  strollers: "/",
  "car-seats": "/car-seats",
  "baby-monitors": "/monitors",
  cribs: "/cribs",
  "high-chairs": "/high-chairs",
};
