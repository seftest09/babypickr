import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

function titleCaseKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRecordLines(obj: Record<string, unknown>, skipKeys: Set<string>): string {
  const lines: string[] = [];
  for (const [key, raw] of Object.entries(obj)) {
    if (skipKeys.has(key)) continue;
    if (raw === undefined || raw === null) continue;
    const label = titleCaseKey(key);
    if (Array.isArray(raw)) {
      lines.push(`- ${label}: ${raw.join(", ")}`);
    } else if (typeof raw === "object") {
      lines.push(`- ${label}: ${JSON.stringify(raw)}`);
    } else {
      lines.push(`- ${label}: ${String(raw)}`);
    }
  }
  return lines.join("\n");
}

const PRODUCT_PROMPT_SKIP = new Set(["asin"]);

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    product?: unknown;
    filters?: unknown;
    category?: unknown;
  };

  const { product, filters, category } = body ?? {};

  if (!product || typeof product !== "object" || Array.isArray(product)) {
    return new Response(JSON.stringify({ error: "Missing or invalid product" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!category || typeof category !== "string" || !category.trim()) {
    return new Response(JSON.stringify({ error: "Missing or invalid category" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const filterRecord =
    filters && typeof filters === "object" && !Array.isArray(filters)
      ? (filters as Record<string, unknown>)
      : {};

  const productRecord = product as Record<string, unknown>;

  const filterBlock = formatRecordLines(filterRecord, new Set());
  const productBlock = formatRecordLines(productRecord, PRODUCT_PROMPT_SKIP);

  const categoryPhrase = category.trim();

  const prompt = `A parent is comparing ${categoryPhrase} options for their baby.

Their current filter preferences:
${filterBlock || "- (none specified; treat as flexible)"}

Details of the product they are considering:
${productBlock}

Write exactly 2 sentences maximum. Be blunt.
Start with the biggest reason this product does or does not fit their situation for this ${categoryPhrase} purchase. Use the word "product" when referring to the item (not the category name as a stand-in for the item).`;

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 150,
    messages: [{ role: "user", content: prompt }],
  });

  return new Response(stream.toReadableStream());
}
