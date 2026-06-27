"use client";

import { useState } from "react";
import Link from "next/link";

type Severity = "Low" | "Medium" | "High";

type Disease = {
  name: string;
  severity: Severity;
  affectedCrops: string[];
  symptoms: string;
  treatment: string[];
  prevention: string;
  spreadRate: string;
};

const DISEASES: Disease[] = [
  {
    name: "Late Blight",
    severity: "High",
    affectedCrops: ["Tomatoes", "Potatoes"],
    symptoms: "Dark water-soaked lesions on leaves and stems, white mold on undersides in humid conditions. Spreads rapidly and can destroy an entire crop in days.",
    treatment: [
      "Apply copper-based fungicide immediately",
      "Remove and destroy all infected plant tissue",
      "Avoid overhead watering — use drip irrigation",
      "Improve air circulation by pruning dense growth",
    ],
    prevention: "Use certified disease-free seed potatoes. Plant resistant varieties. Scout fields after rain.",
    spreadRate: "Very fast (airborne spores, 1–3 days field-wide)",
  },
  {
    name: "Powdery Mildew",
    severity: "Medium",
    affectedCrops: ["Cucumbers", "Peppers", "Beans", "Wheat", "Corn"],
    symptoms: "White or gray powdery coating on leaf surfaces. Leaves may yellow and curl. Most active in warm, dry conditions with high humidity at night.",
    treatment: [
      "Apply potassium bicarbonate or neem oil spray",
      "Remove heavily infected leaves",
      "Increase plant spacing for airflow",
      "Apply sulfur-based fungicide for severe cases",
    ],
    prevention: "Choose resistant varieties. Avoid high-nitrogen fertilizer. Water in the morning so leaves dry by evening.",
    spreadRate: "Moderate (wind-dispersed, spreads over days to weeks)",
  },
  {
    name: "Root Rot",
    severity: "High",
    affectedCrops: ["Soybeans", "Corn", "Tomatoes", "Potatoes", "Carrots"],
    symptoms: "Wilting despite adequate soil moisture. Yellowing lower leaves. Brown/black mushy roots when pulled. Often worse in poorly drained areas.",
    treatment: [
      "Improve soil drainage immediately",
      "Reduce irrigation frequency",
      "Apply Trichoderma-based biological fungicide to soil",
      "Remove severely affected plants to prevent spread",
    ],
    prevention: "Till soil to improve drainage before planting. Rotate crops annually. Avoid compaction.",
    spreadRate: "Slow (soil-borne, spreads through water movement)",
  },
  {
    name: "Aphid Infestation",
    severity: "Medium",
    affectedCrops: ["Lettuce", "Spinach", "Peppers", "Tomatoes", "Beans", "Wheat"],
    symptoms: "Sticky honeydew on leaves. Curled or distorted new growth. Visible colonies of small soft-bodied insects on undersides of leaves. Black sooty mold may develop.",
    treatment: [
      "Spray strong stream of water to knock off aphids",
      "Apply insecticidal soap or neem oil spray",
      "Introduce ladybugs or lacewings (biological control)",
      "Use pyrethrin-based insecticide for heavy infestation",
    ],
    prevention: "Avoid excess nitrogen (attracts aphids). Use reflective mulch. Plant companion flowers like marigolds.",
    spreadRate: "Fast (winged adults spread to new plants within days)",
  },
  {
    name: "Rust",
    severity: "Medium",
    affectedCrops: ["Wheat", "Corn", "Beans", "Onions"],
    symptoms: "Orange, red, or brown pustules on leaves and stems. Pustules burst releasing spore powder. Infected tissue dies back. Yield loss in severe cases.",
    treatment: [
      "Apply propiconazole or tebuconazole fungicide",
      "Remove and destroy infected crop residue",
      "Scout fields weekly during warm humid periods",
    ],
    prevention: "Plant rust-resistant varieties. Rotate crops. Avoid planting near alternate hosts.",
    spreadRate: "Fast (wind-spread, can travel hundreds of miles)",
  },
  {
    name: "Bacterial Leaf Scorch",
    severity: "Low",
    affectedCrops: ["Corn", "Wheat", "Soybeans"],
    symptoms: "Irregular brown scorch marks on leaf margins with yellow halo. Symptoms worsen in hot dry weather. Progresses from lower to upper leaves.",
    treatment: [
      "No curative treatment — focus on management",
      "Apply copper bactericide to slow spread",
      "Maintain adequate soil moisture",
      "Remove heavily infected plants",
    ],
    prevention: "Use heat/drought tolerant varieties. Mulch to retain soil moisture. Avoid wounding plants.",
    spreadRate: "Slow (insect-vectored, local spread over weeks)",
  },
  {
    name: "Fusarium Wilt",
    severity: "High",
    affectedCrops: ["Tomatoes", "Peppers", "Cucumbers", "Corn", "Soybeans"],
    symptoms: "Sudden wilting of one side or the entire plant. Yellow streaking in stem vascular tissue when cut. Lower leaves yellow first. Plant dies within 2–4 weeks.",
    treatment: [
      "Remove and destroy infected plants immediately",
      "Solarize soil with clear plastic for 4–6 weeks",
      "Apply Trichoderma harzianum to remaining plants",
      "Do NOT replant susceptible crops in same area",
    ],
    prevention: "Plant resistant varieties. Rotate crops (4-year minimum). Avoid soil compaction and wounding roots.",
    spreadRate: "Soil-borne (persists 10+ years in soil)",
  },
  {
    name: "Botrytis (Gray Mold)",
    severity: "Medium",
    affectedCrops: ["Tomatoes", "Lettuce", "Spinach", "Strawberries", "Peppers"],
    symptoms: "Gray fuzzy mold on flowers, fruits, and dying tissue. Brown lesions expand rapidly in cool humid conditions. Entire fruit or head can be lost quickly.",
    treatment: [
      "Remove all infected tissue immediately",
      "Apply Bacillus subtilis biocontrol spray",
      "Reduce humidity with increased ventilation",
      "Apply iprodione or fenhexamid fungicide for severe cases",
    ],
    prevention: "Avoid overhead irrigation. Remove dead leaves/flowers promptly. Space plants for airflow. Harvest on schedule.",
    spreadRate: "Very fast in humid conditions (airborne spores, hours to days)",
  },
];

const SEVERITY_STYLE: Record<Severity, { bg: string; text: string; border: string }> = {
  Low:    { bg: "#22c55e22", text: "#22c55e", border: "#22c55e55" },
  Medium: { bg: "#f59e0b22", text: "#f59e0b", border: "#f59e0b55" },
  High:   { bg: "#ef444422", text: "#ef4444", border: "#ef444455" },
};

const ALL_CROPS = [...new Set(DISEASES.flatMap(d => d.affectedCrops))].sort();

export default function DiseasePage() {
  const [search, setSearch] = useState("");
  const [filterCrop, setFilterCrop] = useState("All");
  const [filterSeverity, setFilterSeverity] = useState<Severity | "All">("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = DISEASES.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                        d.symptoms.toLowerCase().includes(search.toLowerCase());
    const matchCrop = filterCrop === "All" || d.affectedCrops.includes(filterCrop);
    const matchSev = filterSeverity === "All" || d.severity === filterSeverity;
    return matchSearch && matchCrop && matchSev;
  });

  return (
    <main className="min-h-screen bg-[#0a1a0a] text-white">
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-lime-400 text-sm hover:text-lime-300">← Back</Link>
        <h1 className="text-lg font-bold tracking-tight">🔬 Disease Library</h1>
        <p className="text-sm text-slate-400 ml-auto hidden sm:block">{DISEASES.length} common crop diseases</p>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search diseases or symptoms…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-lime-400 transition"
          />
          <select
            value={filterCrop}
            onChange={e => setFilterCrop(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-lime-400 transition"
          >
            <option value="All">All crops</option>
            {ALL_CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value as Severity | "All")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-lime-400 transition"
          >
            <option value="All">All severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Results count */}
        <p className="text-xs text-slate-500 mb-4">{filtered.length} disease{filtered.length !== 1 ? "s" : ""} found</p>

        {/* Disease cards */}
        <div className="space-y-3">
          {filtered.map(disease => {
            const s = SEVERITY_STYLE[disease.severity];
            const isOpen = expanded === disease.name;
            return (
              <div
                key={disease.name}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
              >
                {/* Card header — always visible */}
                <button
                  className="w-full flex items-start gap-4 p-5 text-left hover:bg-white/5 transition"
                  onClick={() => setExpanded(isOpen ? null : disease.name)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="font-bold text-white text-base">{disease.name}</h2>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                        style={{ background: s.bg, color: s.text, borderColor: s.border }}
                      >
                        {disease.severity} Risk
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {disease.affectedCrops.map(c => (
                        <span key={c} className="text-xs bg-lime-400/10 border border-lime-400/20 text-lime-400 rounded-full px-2 py-0.5">{c}</span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{disease.symptoms}</p>
                  </div>
                  <span className="text-slate-500 text-lg mt-1 shrink-0">{isOpen ? "▲" : "▼"}</span>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-white/10 px-5 pb-5 pt-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-lime-400 mb-1">Spread Rate</p>
                      <p className="text-sm text-slate-300">{disease.spreadRate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-lime-400 mb-2">Treatment Steps</p>
                      <ol className="space-y-1">
                        {disease.treatment.map((t, i) => (
                          <li key={i} className="flex gap-2 text-sm text-slate-300">
                            <span className="text-lime-400 font-bold shrink-0">{i + 1}.</span>
                            {t}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-lime-400 mb-1">Prevention</p>
                      <p className="text-sm text-slate-300">{disease.prevention}</p>
                    </div>
                    <Link
                      href={`/advice`}
                      className="inline-block mt-1 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 text-sm px-4 py-2 hover:bg-lime-400/20 transition"
                    >
                      📷 Scan my plant for this disease →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
