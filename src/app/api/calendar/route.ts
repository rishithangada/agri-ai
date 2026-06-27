import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { saveFarmProfile } from "@/lib/supabase";

const anthropic = new Anthropic();

const CROPS = [
  "Corn","Wheat","Soybeans","Tomatoes","Potatoes","Lettuce",
  "Peppers","Cucumbers","Beans","Carrots","Onions","Spinach",
];

export type DayForecast = {
  date: string;         // YYYY-MM-DD
  label: string;        // "Mon Jun 30"
  tempMax: number;      // °F
  precip: number;       // inches
  action: "PLANT" | "WAIT" | "HARVEST" | "SPRAY" | "IRRIGATE";
  actionColor: string;
  reason: string;
};

export type CalendarResponse = {
  location: string;
  lat: number;
  lon: number;
  crops: string[];
  days: DayForecast[];
  aiSummary: string;
};

async function geocode(zip: string): Promise<{ lat: number; lon: number; display: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(zip)}&format=json&limit=1&countrycodes=us`;
  const res = await fetch(url, {
    headers: { "User-Agent": "AgriAI/1.0 (rishithang5@gmail.com)" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display: data[0].display_name.split(",").slice(0, 2).join(",") };
}

async function getWeather(lat: number, lon: number): Promise<{ dates: string[]; tempMax: number[]; precip: number[] }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto&forecast_days=7`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();
  return {
    dates: data.daily.time,
    tempMax: data.daily.temperature_2m_max,
    precip: data.daily.precipitation_sum,
  };
}

function ruleBasedAction(tempF: number, precipIn: number, crops: string[]): { action: DayForecast["action"]; color: string; reason: string } {
  // Simple agronomic rules — Claude refines with context
  if (precipIn > 0.8) return { action: "WAIT", color: "#6b7280", reason: "Heavy rain expected — avoid field operations" };
  if (tempF > 95) return { action: "IRRIGATE", color: "#3b82f6", reason: "Heat stress likely — ensure moisture" };
  if (tempF < 40) return { action: "WAIT", color: "#6b7280", reason: "Too cold for most crops" };
  if (tempF >= 60 && tempF <= 85 && precipIn < 0.3) return { action: "PLANT", color: "#22c55e", reason: "Ideal planting conditions" };
  if (tempF >= 75 && crops.some(c => ["Tomatoes","Peppers","Cucumbers"].includes(c))) return { action: "HARVEST", color: "#f59e0b", reason: "Check warm-season crops for harvest readiness" };
  if (precipIn > 0.2 && precipIn <= 0.8) return { action: "SPRAY", color: "#8b5cf6", reason: "Moist conditions — good timing for fungicide/pesticide" };
  return { action: "WAIT", color: "#6b7280", reason: "Suboptimal conditions — monitor and wait" };
}

export async function POST(req: Request) {
  try {
    const { zip, crops, sessionId = "anonymous" }: { zip: string; crops: string[]; sessionId?: string } = await req.json();
    if (!zip || !crops?.length) return NextResponse.json({ error: "zip and crops required" }, { status: 400 });

    const geo = await geocode(zip);
    if (!geo) return NextResponse.json({ error: "Could not find that ZIP code" }, { status: 400 });

    const weather = await getWeather(geo.lat, geo.lon);

    // Build per-day rule-based actions
    const days: DayForecast[] = weather.dates.map((date, i) => {
      const tempMax = Math.round(weather.tempMax[i]);
      const precip = Math.round(weather.precip[i] * 100) / 100;
      const { action, color, reason } = ruleBasedAction(tempMax, precip, crops);
      const d = new Date(date + "T12:00:00");
      return {
        date,
        label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        tempMax,
        precip,
        action,
        actionColor: color,
        reason,
      };
    });

    // Claude gives a 2-sentence weekly summary + any crop-specific overrides
    const weatherSummary = days.map(d => `${d.label}: ${d.tempMax}°F, ${d.precip}" rain → ${d.action}`).join("\n");
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `You are an agronomist. The farmer is growing: ${crops.join(", ")} near ${geo.display}.\n\nWeather + actions this week:\n${weatherSummary}\n\nWrite 2 sentences: a weekly summary and the single most important action for this farmer to take right now. Be specific to their crops.`,
      }],
    });

    const aiSummary = msg.content[0].type === "text" ? msg.content[0].text : "";

    const response: CalendarResponse = {
      location: geo.display,
      lat: geo.lat,
      lon: geo.lon,
      crops,
      days,
      aiSummary,
    };

    // Save farm profile so user doesn't re-enter ZIP + crops next visit
    saveFarmProfile({ session_id: sessionId, zip, location_display: geo.display, lat: geo.lat, lon: geo.lon, crops }).catch(() => {});

    return NextResponse.json(response);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export { CROPS };
