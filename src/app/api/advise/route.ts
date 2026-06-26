import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert agronomist with 30 years of hands-on farm experience.
Give specific, actionable advice tailored to the farmer's situation. Structure your response as JSON with these fields:
- diagnosis: string (what's likely causing the problem)
- immediateActions: string[] (3-5 things to do TODAY)
- weekPlan: string[] (3-5 actions for the next 7 days)
- products: string[] (specific products/treatments to use, organic options first)
- warnings: string[] (warning signs to watch for)
- confidence: number (0-100, how confident you are in the diagnosis)

Keep advice practical, affordable, and accessible to small family farms. Avoid jargon. Be specific with quantities and timing.`;

type AdviseBody = {
  crop: string;
  stage: string;
  location: string;
  soil: string;
  problem: string;
};

// Fallback when no API key
function mockResponse(body: AdviseBody) {
  return {
    diagnosis: `Based on your description of ${body.crop} at ${body.stage} stage with ${body.soil} soil, this appears to be a nutrient deficiency or early fungal infection. Without lab testing, yellow edges on leaves most commonly indicate potassium or magnesium deficiency.`,
    immediateActions: [
      "Check soil moisture — overwatering can lock out nutrients",
      "Remove the most affected lower leaves to prevent spread",
      "Apply a foliar spray of diluted Epsom salt (1 tbsp per gallon) if magnesium deficiency suspected",
      "Inspect leaf undersides for mites or aphids under a magnifying glass",
    ],
    weekPlan: [
      "Day 1-2: Take soil sample to your local extension office for testing",
      "Day 3: Based on soil test, apply balanced fertilizer (10-10-10) at half rate",
      "Day 5: Monitor treated plants for improvement",
      "Day 7: If no improvement, consider fungicide application",
    ],
    products: [
      "Epsom salt (magnesium sulfate) — organic, $4/lb at most garden stores",
      "Fish emulsion fertilizer — organic, balanced nutrition",
      "Mycorrhizal inoculant — improves nutrient uptake long-term",
      "Neem oil spray — if pests are confirmed",
    ],
    warnings: [
      "If yellowing spreads to upper/newer leaves, issue is more serious — call county extension",
      "Brown crispy edges (not just yellow) indicate salt burn from over-fertilizing",
      "Wilting despite adequate water could mean root rot",
    ],
    confidence: 65,
  };
}

export async function POST(req: NextRequest) {
  const body: AdviseBody = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // ponytail: mock fallback so dev works without API key
    return NextResponse.json(mockResponse(body));
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey });

  const userMessage = `Farmer's situation:
- Crop: ${body.crop}
- Growth stage: ${body.stage}
- Location: ${body.location || "not specified"}
- Soil type: ${body.soil}
- Problem: ${body.problem}

Please provide your expert agronomist advice as JSON.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json(mockResponse(body));

  try {
    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch {
    return NextResponse.json(mockResponse(body));
  }
}
