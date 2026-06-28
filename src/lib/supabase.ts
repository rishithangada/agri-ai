import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

export type FarmProfile = {
  session_id: string;
  zip?: string;
  farm_size?: string;
  location_display?: string;
  lat?: number;
  lon?: number;
  crops?: string[];
  soil_type?: string;
};

export async function saveFarmProfile(profile: FarmProfile) {
  const { error } = await supabase
    .from("farm_profiles")
    .upsert(profile, { onConflict: "session_id" });
  if (!error) return;

  const fallbackProfile: Omit<FarmProfile, "farm_size"> = {
    session_id: profile.session_id,
    zip: profile.zip,
    location_display: profile.location_display,
    lat: profile.lat,
    lon: profile.lon,
    crops: profile.crops,
    soil_type: profile.soil_type,
  };
  const fallback = await supabase
    .from("farm_profiles")
    .upsert(fallbackProfile, { onConflict: "session_id" });
  if (fallback.error) console.error("saveFarmProfile:", fallback.error.message);
}

export async function getFarmProfile(sessionId: string): Promise<FarmProfile | null> {
  const { data, error } = await supabase
    .from("farm_profiles")
    .select("*")
    .eq("session_id", sessionId)
    .single();
  if (error && error.code !== "PGRST116") console.error("getFarmProfile:", error.message);
  return data ?? null;
}
