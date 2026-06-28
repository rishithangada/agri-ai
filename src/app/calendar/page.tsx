"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionId } from "@/lib/session";
import { getFarmProfile, saveFarmProfile, type FarmProfile } from "@/lib/supabase";
import type { CalendarResponse, DayForecast } from "../api/calendar/route";

const ALL_CROPS = [
  "Corn","Wheat","Soybeans","Tomatoes","Potatoes","Lettuce",
  "Peppers","Cucumbers","Beans","Carrots","Onions","Spinach",
];

const ONBOARDING_CROPS = ["Corn", "Tomatoes", "Wheat", "Soybeans", "Cotton", "Other"];
const FARM_PROFILE_KEY = "agri_farm_profile";

type StoredFarmProfile = FarmProfile & {
  farm_size?: string;
};

const ACTION_ICON: Record<DayForecast["action"], string> = {
  PLANT: "🌱", WAIT: "⏸", HARVEST: "🌾", SPRAY: "💧", IRRIGATE: "🚿",
};

function DayCard({ day }: { day: DayForecast }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{day.label}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-white">{day.tempMax}°F</span>
        <span className="text-sm text-slate-400">{day.precip} in rain</span>
      </div>
      <div
        className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
        style={{ background: day.actionColor + "22", color: day.actionColor, border: `1px solid ${day.actionColor}55` }}
      >
        <span className="text-base">{ACTION_ICON[day.action]}</span>
        {day.action}
      </div>
      <p className="text-xs leading-snug text-slate-400">{day.reason}</p>
    </div>
  );
}

export default function CalendarPage() {
  const [zip, setZip] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingZip, setOnboardingZip] = useState("");
  const [onboardingCrops, setOnboardingCrops] = useState<string[]>([]);
  const [farmSize, setFarmSize] = useState("1-10 acres");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CalendarResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const sessionId = getSessionId();
      const stored = localStorage.getItem(FARM_PROFILE_KEY);
      if (stored) {
        try {
          const profile = JSON.parse(stored) as StoredFarmProfile;
          if (!cancelled) {
            setZip(profile.zip ?? "");
            setSelectedCrops(profile.crops ?? []);
            setOnboardingZip(profile.zip ?? "");
            setOnboardingCrops(profile.crops ?? []);
            setFarmSize(profile.farm_size ?? "1-10 acres");
            setProfileLoaded(true);
          }
          return;
        } catch {
          localStorage.removeItem(FARM_PROFILE_KEY);
        }
      }

      const remoteProfile = await getFarmProfile(sessionId);
      if (cancelled) return;
      if (remoteProfile?.zip || remoteProfile?.crops?.length) {
        const profile = remoteProfile as StoredFarmProfile;
        localStorage.setItem(FARM_PROFILE_KEY, JSON.stringify(profile));
        setZip(profile.zip ?? "");
        setSelectedCrops(profile.crops ?? []);
        setOnboardingZip(profile.zip ?? "");
        setOnboardingCrops(profile.crops ?? []);
        setFarmSize(profile.farm_size ?? "1-10 acres");
      } else {
        setShowOnboarding(true);
      }
      setProfileLoaded(true);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  function toggleCrop(crop: string) {
    setSelectedCrops(prev =>
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  }

  function toggleOnboardingCrop(crop: string) {
    setOnboardingCrops(prev =>
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  }

  async function saveOnboarding(e: React.FormEvent) {
    e.preventDefault();
    if (!onboardingZip.trim() || onboardingCrops.length === 0) {
      setError("Enter your ZIP code and select at least one crop.");
      return;
    }

    const profile: StoredFarmProfile = {
      session_id: getSessionId(),
      zip: onboardingZip.trim(),
      crops: onboardingCrops,
      farm_size: farmSize,
    };
    localStorage.setItem(FARM_PROFILE_KEY, JSON.stringify(profile));
    setZip(profile.zip ?? "");
    setSelectedCrops(profile.crops ?? []);
    setShowOnboarding(false);
    setError("");
    await saveFarmProfile(profile);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!zip.trim() || selectedCrops.length === 0) {
      setError("Enter your ZIP code and select at least one crop.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip: zip.trim(), crops: selectedCrops, sessionId: getSessionId() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load forecast");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a1a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-lime-400 text-sm hover:text-lime-300">← Back</Link>
        <h1 className="text-lg font-bold tracking-tight">🗓 Planting Calendar</h1>
        <p className="text-sm text-slate-400 ml-auto hidden sm:block">7-day weather-driven farm plan</p>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-lime-400 mb-2">Your ZIP Code</label>
            <input
              type="text"
              value={zip}
              onChange={e => {
                setZip(e.target.value);
                const stored = localStorage.getItem(FARM_PROFILE_KEY);
                if (stored) {
                  try {
                    const profile = JSON.parse(stored) as StoredFarmProfile;
                    localStorage.setItem(FARM_PROFILE_KEY, JSON.stringify({ ...profile, zip: e.target.value }));
                  } catch {
                    localStorage.removeItem(FARM_PROFILE_KEY);
                  }
                }
              }}
              placeholder="e.g. 78701"
              maxLength={10}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-lime-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-lime-400 mb-3">What are you growing?</label>
            <div className="flex flex-wrap gap-2">
              {ALL_CROPS.map(crop => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => toggleCrop(crop)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium border transition ${
                    selectedCrops.includes(crop)
                      ? "bg-lime-400 text-black border-lime-400"
                      : "border-white/20 text-slate-300 hover:border-lime-400/50"
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-lime-400 py-3 font-bold text-black hover:bg-lime-300 transition disabled:opacity-50"
          >
            {loading ? "Fetching forecast…" : "Get My 7-Day Plan"}
          </button>
        </form>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Location + crops */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-400 text-sm">📍 {result.location}</span>
              {result.crops.map(c => (
                <span key={c} className="rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs px-3 py-1">{c}</span>
              ))}
            </div>

            {/* AI summary */}
            <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-lime-400 mb-2">AI Agronomist Summary</p>
              <p className="text-sm leading-relaxed text-slate-200">{result.aiSummary}</p>
            </div>

            {/* 7-day grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {result.days.map(day => <DayCard key={day.date} day={day} />)}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              {[
                { action: "PLANT", color: "#22c55e", icon: "🌱" },
                { action: "HARVEST", color: "#f59e0b", icon: "🌾" },
                { action: "SPRAY", color: "#8b5cf6", icon: "💧" },
                { action: "IRRIGATE", color: "#3b82f6", icon: "🚿" },
                { action: "WAIT", color: "#6b7280", icon: "⏸" },
              ].map(l => (
                <span key={l.action} style={{ color: l.color }}>{l.icon} {l.action}</span>
              ))}
            </div>

            <button
              onClick={() => { setResult(null); setZip(""); setSelectedCrops([]); }}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              ← Plan for a different location
            </button>
          </div>
        )}
      </div>

      {showOnboarding && profileLoaded && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form onSubmit={saveOnboarding} className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f250f] p-6 shadow-2xl">
            <h2 className="text-2xl font-bold">Farm profile</h2>
            <p className="mt-2 text-sm text-slate-300">Save your farm details so the calendar opens pre-filled next time.</p>

            <label className="mt-5 block text-sm font-semibold text-lime-400">
              ZIP code
              <input
                value={onboardingZip}
                onChange={(e) => setOnboardingZip(e.target.value)}
                maxLength={10}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-lime-400"
                placeholder="e.g. 78701"
              />
            </label>

            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold text-lime-400">Primary crops</p>
              <div className="flex flex-wrap gap-2">
                {ONBOARDING_CROPS.map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => toggleOnboardingCrop(crop)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                      onboardingCrops.includes(crop)
                        ? "border-lime-400 bg-lime-400 text-black"
                        : "border-white/20 text-slate-300"
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-5 block text-sm font-semibold text-lime-400">
              Farm size
              <select
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-lime-400"
              >
                <option>Under 1 acre</option>
                <option>1-10 acres</option>
                <option>11-100 acres</option>
                <option>100+ acres</option>
              </select>
            </label>

            <button type="submit" className="mt-6 w-full rounded-xl bg-lime-400 py-3 font-bold text-black hover:bg-lime-300">
              Save farm profile
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
