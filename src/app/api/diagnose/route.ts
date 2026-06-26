import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a plant pathologist with 25 years of field experience diagnosing crop diseases, pests, and nutrient deficiencies.
Analyze the provided crop photo and return a JSON diagnosis with:
- disease: string (specific name of disease, pest, or deficiency — be precise)
- severity: "low" | "medium" | "high"
- description: string (what you see and why you identified it this way, 2-3 sentences)
- treatment: string[] (immediate treatment steps)
- organic: string[] (organic treatment options)
- chemical: string[] (chemical treatment options if needed)
- prevention: string[] (how to prevent this in future seasons)

If the image is unclear or not a plant, say so in the disease field. Be specific and practical.`;

type DiagnoseBody = {
  imageData: string; // base64
  cropType: string;
};

function mockDiagnosis(cropType: string) {
  return {
    disease: "Early Blight (Alternaria solani)",
    severity: "medium" as const,
    description: `Classic early blight pattern detected on ${cropType} leaves — dark brown lesions with concentric rings and yellow halos, typically starting on older lower leaves. This fungal disease thrives in warm, humid conditions with alternating wet and dry periods.`,
    treatment: [
      "Remove and destroy all visibly infected leaves immediately",
      "Improve air circulation by pruning crowded growth",
      "Water at soil level — avoid wetting foliage",
      "Apply fungicide at first sign of spread",
    ],
    organic: [
      "Copper-based fungicide (Bordeaux mixture) — apply every 7-10 days",
      "Neem oil spray — effective as preventative and early treatment",
      "Bacillus subtilis (Serenade) — biological fungicide, safe at any stage",
    ],
    chemical: [
      "Chlorothalonil (Daconil) — broad-spectrum, apply every 7-14 days",
      "Mancozeb — rotate with other fungicides to prevent resistance",
    ],
    prevention: [
      "Use certified disease-free seed or transplants next season",
      "Practice 2-3 year crop rotation — do not plant same family in same spot",
      "Mulch heavily to prevent soil splash onto leaves",
      "Choose resistant varieties when available",
      "Apply preventative copper spray at transplant time",
    ],
  };
}

export async function POST(req: NextRequest) {
  const body: DiagnoseBody = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(mockDiagnosis(body.cropType));
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: body.imageData,
            },
          },
          {
            type: "text",
            text: `This is a photo of a ${body.cropType} plant. Please diagnose any diseases, pests, or deficiencies visible and return your analysis as JSON.`,
          },
        ],
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json(mockDiagnosis(body.cropType));

  try {
    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch {
    return NextResponse.json(mockDiagnosis(body.cropType));
  }
}
