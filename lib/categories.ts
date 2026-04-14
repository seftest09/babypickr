export const CATEGORIES = [
  { id: "strollers", label: "Strollers" },
  { id: "car-seats", label: "Car Seats" },
  { id: "baby-monitors", label: "Baby Monitors" },
  { id: "cribs", label: "Cribs" },
  { id: "high-chairs", label: "High Chairs" },
  { id: "coming-soon", label: "Coming Soon..." },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
