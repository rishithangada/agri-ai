import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1a3300]">
        <div className="flex items-center gap-2">
          <LeafIcon className="w-7 h-7 text-[#84cc16]" />
          <span className="font-bold text-lg tracking-tight text-[#84cc16]">AgriAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/calendar" className="text-sm text-[#84cc16] hover:underline">🗓 Calendar</Link>
          <Link href="/disease" className="text-sm text-[#84cc16] hover:underline">🔬 Diseases</Link>
          <Link
            href="/advice"
            className="text-sm bg-[#84cc16] text-[#0c1a00] font-semibold px-4 py-2 rounded-full hover:bg-[#a3e635] transition-colors"
          >
            Get Free Advice
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-12 gap-6">
        <div className="relative">
          <LeafIcon className="w-24 h-24 text-[#84cc16]" />
          <div className="absolute -inset-4 bg-[#84cc16]/10 rounded-full blur-xl" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#fef9c3] leading-tight">
            Your AI Agronomist
          </h1>
          <p className="mt-3 text-xl text-[#84cc16] font-medium">
            Pro-level farm advice — free
          </p>
          <p className="mt-2 text-[#fef9c3]/70 max-w-md mx-auto text-base">
            The same expertise that used to cost $200/hr, now in your pocket. Diagnose crop disease, plan your season, and get weather-aware planting schedules instantly.
          </p>
        </div>
        <Link
          href="/advice"
          className="mt-2 inline-flex items-center gap-2 bg-[#f59e0b] text-[#78350f] font-bold text-lg px-8 py-4 rounded-2xl hover:bg-[#fbbf24] active:scale-95 transition-all shadow-lg shadow-[#f59e0b]/20"
        >
          Start with your crop →
        </Link>
      </section>

      {/* Feature cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pb-12 max-w-4xl mx-auto w-full">
        <FeatureCard
          icon={<CameraIcon />}
          title="Diagnose Crop Disease"
          desc="Snap a photo of a sick plant. Get instant identification, severity rating, and a full treatment plan — organic options first."
        />
        <FeatureCard
          icon={<CalendarIcon />}
          title="Get Planting Advice"
          desc="Tell us your crop, soil, and location. We'll give you a tailored planting schedule based on your specific conditions."
        />
        <FeatureCard
          icon={<CloudIcon />}
          title="Weather-Aware Scheduling"
          desc="Advice that accounts for your local weather patterns. Know when to plant, irrigate, and harvest for maximum yield."
        />
      </section>

      {/* Testimonial */}
      <section className="mx-6 mb-12 max-w-2xl md:mx-auto bg-[#0f2200] border border-[#1a3300] rounded-2xl p-6">
        <p className="text-[#fef9c3] text-lg italic leading-relaxed">
          &ldquo;Used to pay $200/hr for this advice. Now I get it for free. My tomato yield is up 30% this season.&rdquo;
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#78350f] flex items-center justify-center text-[#fef9c3] font-bold text-sm">
            ML
          </div>
          <div>
            <p className="font-semibold text-[#84cc16] text-sm">Maria Lopez</p>
            <p className="text-[#fef9c3]/50 text-xs">Family farm, Central Valley CA</p>
          </div>
        </div>
      </section>

      {/* Counter */}
      <section className="text-center pb-16 px-6">
        <p className="text-[#fef9c3]/60 text-sm">
          Trusted by{" "}
          <span className="text-[#84cc16] font-bold text-base">1,000+</span>{" "}
          family farms across the country
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-[#fef9c3]/40 text-xs">
          <span>Corn Farmers</span>
          <span>•</span>
          <span>Tomato Growers</span>
          <span>•</span>
          <span>Wheat Producers</span>
          <span>•</span>
          <span>Cotton Farms</span>
        </div>
      </section>

      <footer className="mt-auto border-t border-[#1a3300] px-6 py-4 text-center text-[#fef9c3]/40 text-xs">
        AgriAI — An agronomist in every pocket. Free, always.
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-[#0f2200] border border-[#1a3300] rounded-2xl p-6 flex flex-col gap-3 hover:border-[#84cc16]/40 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16]">
        {icon}
      </div>
      <h3 className="font-bold text-[#fef9c3] text-base">{title}</h3>
      <p className="text-[#fef9c3]/60 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 8C8 10 5.9 16.17 3.82 21L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 3-13 4 0 0 2-4 8-4z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 .75-7.414 5.25 5.25 0 0 0-10.233-2.33 3 3 0 0 0-3.758 3.848A4.5 4.5 0 0 0 2.25 15Z" />
    </svg>
  );
}
