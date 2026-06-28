import Link from "next/link";

const STATS = [
  { value: "1,200+", label: "Active Farms" },
  { value: "14", label: "Crop Types" },
  { value: "7-day", label: "Forecast Window" },
  { value: "Free", label: "Always" },
];

const FEATURES = [
  {
    icon: "🌤",
    title: "Weather-aware planting calendar",
    desc: "Enter your ZIP and crops. Get a 7-day PLANT / WAIT / IRRIGATE action plan built from real Open-Meteo forecast data — not generic advice.",
    href: "/calendar",
    cta: "Open calendar →",
  },
  {
    icon: "🔬",
    title: "Crop disease library",
    desc: "Browse 8 common diseases with severity ratings, symptoms, organic treatment steps, and spread rate — no camera needed.",
    href: "/disease",
    cta: "Browse diseases →",
  },
  {
    icon: "🤖",
    title: "AI agronomist advice",
    desc: "Ask anything about your crops, soil, or season. Expert-level guidance from an AI trained on agronomic best practices.",
    href: "/advice",
    cta: "Ask the AI →",
  },
];

const MOCK_DAYS = [
  { label: "Fri Jun 27", temp: 82, rain: '0.0"', action: "PLANT",   actionBg: "rgba(34,197,94,0.12)",  actionColor: "#22c55e", delay: "anim-fade-up-1" },
  { label: "Sat Jun 28", temp: 79, rain: '0.1"', action: "PLANT",   actionBg: "rgba(34,197,94,0.12)",  actionColor: "#22c55e", delay: "anim-fade-up-2" },
  { label: "Sun Jun 29", temp: 91, rain: '0.0"', action: "IRRIGATE",actionBg: "rgba(59,130,246,0.12)", actionColor: "#3b82f6", delay: "anim-fade-up-3" },
  { label: "Mon Jun 30", temp: 94, rain: '0.0"', action: "IRRIGATE",actionBg: "rgba(59,130,246,0.12)", actionColor: "#3b82f6", delay: "anim-fade-up-4" },
  { label: "Tue Jul 1",  temp: 76, rain: '0.6"', action: "SPRAY",   actionBg: "rgba(139,92,246,0.12)", actionColor: "#8b5cf6", delay: "anim-fade-up-4" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden" style={{ background: "#030d01" }}>
      {/* Ambient glow */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background:
          "radial-gradient(ellipse 65% 55% at 2% -8%, rgba(132,204,22,0.22) 0%, transparent 55%)," +
          "radial-gradient(ellipse 45% 40% at 98% 100%, rgba(74,222,128,0.09) 0%, transparent 55%)",
      }} />

      {/* Nav */}
      <nav style={{ position: "relative", zIndex: 10, borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #84cc16 0%, #4ade80 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <LeafIcon style={{ width: 18, height: 18, color: "#030d01" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: "-0.04em" }}>Rootly</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/calendar" className="text-sm text-white/45 hover:text-white transition-colors">Calendar</Link>
          <Link href="/disease" className="text-sm text-white/45 hover:text-white transition-colors">Diseases</Link>
          <Link href="/advice" className="text-sm font-semibold bg-[#84cc16] text-[#030d01] px-4 py-2 rounded-full hover:bg-[#a3e635] transition-colors">
            Get Advice →
          </Link>
        </div>
      </nav>

      {/* Hero — farm photo background */}
      <section style={{ position: "relative", zIndex: 10 }}>
        {/* Full-bleed photo strip */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage:
            "linear-gradient(to bottom, rgba(3,13,1,0.78) 0%, rgba(3,13,1,0.55) 40%, rgba(3,13,1,0.95) 100%)," +
            "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-20 grid md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_460px] gap-10 lg:gap-16 items-center">
          {/* Left */}
          <div className="anim-fade-up">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: "1px solid rgba(132,204,22,0.25)", borderRadius: 999,
              padding: "6px 14px", marginBottom: 28,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "#84cc16", background: "rgba(132,204,22,0.07)",
            }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#84cc16", display: "inline-block" }} />
              Free · No sign-up required
            </div>

            <h1 style={{
              fontSize: "clamp(3rem, 6.5vw, 5rem)",
              fontWeight: 900, lineHeight: 0.93, letterSpacing: "-0.045em",
              color: "#fff", margin: "0 0 22px",
            }}>
              Your AI<br />agronomist.<br />
              <span style={{ color: "#84cc16" }}>Always free.</span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.5)", maxWidth: 460, margin: "0 0 36px" }}>
              The expertise that costs $200/hr at a consulting firm — free in your browser.
              Weather-aware planting calendars, disease diagnosis, and instant expert advice.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/calendar" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#84cc16", color: "#030d01",
                fontWeight: 700, fontSize: 16,
                padding: "14px 28px", borderRadius: 14, textDecoration: "none",
              }} className="hover:bg-[#a3e635] active:scale-95 transition-all">
                View My 7-Day Plan →
              </Link>
              <Link href="/advice" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 16,
                padding: "14px 28px", borderRadius: 14, textDecoration: "none",
              }} className="hover:bg-white/[0.12] transition-all">
                Ask the AI
              </Link>
            </div>

            {/* Stats */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "28px 40px",
              marginTop: 48, paddingTop: 48,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}>
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: calendar mockup */}
          <div style={{
            background: "rgba(3,13,1,0.7)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20, padding: 20,
            boxShadow: "0 48px 96px rgba(0,0,0,0.6), 0 0 0 1px rgba(132,204,22,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Planting Calendar</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>ZIP 78701 · Corn, Tomatoes</div>
              </div>
              <div className="pulse-dot" style={{
                fontSize: 11, fontWeight: 700, color: "#84cc16",
                background: "rgba(132,204,22,0.1)", padding: "4px 10px", borderRadius: 999,
                letterSpacing: "0.04em",
              }}>LIVE</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {MOCK_DAYS.map(({ label, temp, rain, action, actionBg, actionColor, delay }) => (
                <div key={label} className={delay} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "11px 14px",
                }}>
                  <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", minWidth: 64, textAlign: "center" }}>
                    {temp}°F · {rain}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                    color: actionColor, background: actionBg,
                    padding: "4px 10px", borderRadius: 8,
                    minWidth: 72, textAlign: "center",
                  }}>
                    {action}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 14, padding: "13px 15px",
              background: "rgba(132,204,22,0.05)",
              border: "1px solid rgba(132,204,22,0.15)",
              borderRadius: 12, fontSize: 12, color: "rgba(255,255,255,0.58)", lineHeight: 1.65,
            }}>
              🌱 <span style={{ color: "#84cc16", fontWeight: 600 }}>AI Summary: </span>
              Plant Friday–Saturday while temps are mild. Irrigate Sunday–Monday as heat climbs toward 94°F. Tuesday&#39;s rain window is ideal for fungicide application.
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section style={{ position: "relative", zIndex: 10 }} className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, desc, href, cta }) => (
            <Link key={title} href={href} style={{ textDecoration: "none" }} className="group">
              <div style={{
                height: "100%",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderTop: "1px solid rgba(132,204,22,0.3)",
                borderRadius: 16, padding: 24,
                transition: "background 0.2s",
              }} className="group-hover:bg-[#84cc16]/[0.04]">
                <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8, letterSpacing: "-0.02em", lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.7, marginBottom: 16 }}>{desc}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#84cc16" }}>{cta}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}
        className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between flex-wrap gap-4">
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.22)" }}>Rootly — an agronomist in every pocket</span>
        <div style={{ display: "flex", gap: 20 }}>
          {["Calendar", "Diseases", "Advice"].map((page) => (
            <Link key={page} href={`/${page.toLowerCase()}`}
              style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", textDecoration: "none" }}
              className="hover:text-white/60 transition-colors">
              {page}
            </Link>
          ))}
        </div>
      </footer>
    </main>
  );
}

function LeafIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 8C8 10 5.9 16.17 3.82 21L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 3-13 4 0 0 2-4 8-4z" />
    </svg>
  );
}
