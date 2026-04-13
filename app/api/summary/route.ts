import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { stroller, filters } = await req.json();

  const prompt = `A parent is shopping for a stroller with these needs:
- Budget tier: ${filters.budget === "all" ? "flexible" : filters.budget}
- Living space: ${filters.space === "all" ? "not specified" : filters.space}
- Parent height: ${filters.parentHeight === "all" ? "average" : filters.parentHeight}
- Priority: ${filters.priority === "all" ? "balanced" : filters.priority}

The stroller they're considering:
- Name: ${stroller.name}
- Price: $${stroller.price}
- Weight: ${stroller.weightLbs} lbs
- Fold: ${stroller.foldType} fold
- Apartment friendly: ${stroller.apartmentFriendly}
- Tall parent friendly: ${stroller.tallParentFriendly}
- Top feature: ${stroller.topFeature}

Write exactly 2 sentences maximum. Be blunt.
Start with the biggest reason it fits or doesn't fit
their situation.`;

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 150,
    messages: [{ role: "user", content: prompt }],
  });

  return new Response(stream.toReadableStream());
}