import { getTag } from "@/config/affiliate"

export function buildAmazonLink(asin: string): string {
  const tag = getTag()
  return `https://www.amazon.com/dp/${asin}?tag=${tag}`
}