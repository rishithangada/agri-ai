"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SETTINGS_KEY = "agri_settings";

type Settings = {
  displayName: string;
  email: string;
  browserPush: boolean;
};

const DEFAULT_SETTINGS: Settings = { displayName: "", email: "", browserPush: false };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      } catch {
        localStorage.removeItem(SETTINGS_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function save(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
  }

  function clearData() {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem("agri_farm_profile");
    setSettings(DEFAULT_SETTINGS);
    setSaved(false);
  }

  return (
    <main className="min-h-screen bg-[#0a1a0a] px-5 py-8 text-white">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-sm text-lime-400 hover:text-lime-300">Back</Link>
        <h1 className="mt-6 text-3xl font-semibold">Settings</h1>
        <form onSubmit={save} className="mt-6 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
          <label className="grid gap-2 text-sm text-slate-300">
            Display name
            <input value={settings.displayName} onChange={(e) => setSettings({ ...settings, displayName: e.target.value })} className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Email
            <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input type="checkbox" checked={settings.browserPush} onChange={(e) => setSettings({ ...settings, browserPush: e.target.checked })} />
            Browser push notifications
          </label>
          <button className="rounded-lg bg-lime-400 px-4 py-2 font-semibold text-black">Save settings</button>
          {saved && <p className="text-sm text-lime-200">Saved locally.</p>}
        </form>
        <button onClick={clearData} className="mt-4 rounded-lg border border-red-300/30 px-4 py-2 text-sm text-red-200">Clear local data</button>
      </div>
    </main>
  );
}
