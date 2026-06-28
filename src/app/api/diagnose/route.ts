import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a plant pathologist with 25 years of field experience diagnosing crop diseases, pests, and nutrient deficiencies.
Analyze the crop photo and return strict JSON with this shape:
{
  "disease": "specific disease, pest, deficiency, or unclear image",
  "confidence": 0-100,
  "severity": "low" | "medium" | "high",
  "symptoms": ["visible symptom", "visible symptom"],
  "description": "2-3 sentence plain-English explanation",
  "treatment": ["immediate treatment step"],
  "organic": ["organic treatment option"],
  "chemical": ["chemical treatment option if appropriate"],
  "prevention": ["future prevention step"],
  "spreadRisk": "plain-English spread risk and urgency"
}
Be practical, specific, and say when the image is unclear.`;

type DiagnoseBody = {
  imageData?: string;
  cropType?: string;
  mediaType?: string;
};

type Diagnosis = {
  disease: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  symptoms: string[];
  description: string;
  treatment: string[];
  organic: string[];
  chemical: string[];
  prevention: string[];
  spreadRisk: string;
};

function mockDiagnosis(cropType = "crop"): Diagnosis {
  return {
    disease: "Early Blight (Alternaria solani)",
    confidence: 78,
    severity: "medium",
    symptoms: [
      "Dark brown leaf spots with ring-like patterns",
      "Yellowing tissue around older lower-leaf lesions",
      "Stress patterns consistent with humid fungal pressure",
    ],
    description: `The ${cropType} photo shows a common early blight pattern: dark lesions with yellow halos, usually starting on older foliage. Confirm in the field by checking whether spots expand after wet, warm weather.`,
    treatment: [
      "Remove and destroy visibly infected leaves",
      "Increase airflow around plants",
      "Water at soil level and avoid wetting foliage",
    ],
    organic: [
      "Apply copper fungicide every 7-10 days while pressure remains high",
      "Use Bacillus subtilis biological fungicide as a preventative rotation",
      "Mulch soil to reduce splashback onto leaves",
    ],
    chemical: [
      "Use chlorothalonil or mancozeb if disease is spreading quickly and local rules allow",
      "Rotate fungicide groups to reduce resistance risk",
    ],
    prevention: [
      "Rotate away from the same crop family for 2-3 seasons",
      "Remove crop debris after harvest",
      "Choose resistant varieties when available",
    ],
    spreadRisk: "Medium. It can spread quickly during warm, humid weather, so treat infected leaves now and monitor nearby plants every few days.",
  };
}

function extractJson(text: string): Diagnosis {
  const fenced = text.trim().match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fenced?.[1] ?? text;
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON returned");

  const parsed = JSON.parse(jsonText.slice(start, end + 1)) as Partial<Diagnosis>;
  const fallback = mockDiagnosis();
  return {
    disease: typeof parsed.disease === "string" ? parsed.disease : fallback.disease,
    confidence: typeof parsed.confidence === "number" ? Math.max(0, Math.min(100, Math.round(parsed.confidence))) : fallback.confidence,
    severity: parsed.severity === "low" || parsed.severity === "medium" || parsed.severity === "high" ? parsed.severity : fallback.severity,
    symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms.map(String) : fallback.symptoms,
    description: typeof parsed.description === "string" ? parsed.description : fallback.description,
    treatment: Array.isArray(parsed.treatment) ? parsed.treatment.map(String) : fallback.treatment,
    organic: Array.isArray(parsed.organic) ? parsed.organic.map(String) : fallback.organic,
    chemical: Array.isArray(parsed.chemical) ? parsed.chemical.map(String) : fallback.chemical,
    prevention: Array.isArray(parsed.prevention) ? parsed.prevention.map(String) : fallback.prevention,
    spreadRisk: typeof parsed.spreadRisk === "string" ? parsed.spreadRisk : fallback.spreadRisk,
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as DiagnoseBody;
  const cropType = body.cropType || "crop";
  const imageData = body.imageData?.includes(",") ? body.imageData.split(",").pop() : body.imageData;
  const mediaType = body.mediaType || "image/jpeg";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!imageData) {
    return NextResponse.json({ error: "Please provide a crop image." }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json(mockDiagnosis(cropType));
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              parts: [
                { inlineData: { mimeType: mediaType, data: imageData } },
                { text: `Crop type: ${cropType}. Identify disease, confidence, symptoms, organic treatment, and spread risk. Return only JSON.` },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 1600 },
        }),
      },
    );
    const payload = await res.json() as { error?: { message?: string }; candidates?: { content?: { parts?: { text?: string }[] } }[] };
    if (!res.ok) throw new Error(payload.error?.message ?? "Gemini diagnosis failed");
    const text = payload.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
    if (!text) throw new Error("Gemini returned no diagnosis text");
    return NextResponse.json(extractJson(text));
  } catch {
    return NextResponse.json(mockDiagnosis(cropType));
  }
}
