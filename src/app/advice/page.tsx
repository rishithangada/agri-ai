"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tab = "crop" | "disease";

const CROPS = ["Corn", "Wheat", "Soybeans", "Cotton", "Rice", "Tomatoes", "Potatoes", "Lettuce", "Other"];
const STAGES = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest-ready"];
const SOILS = ["Clay", "Sandy", "Loamy", "Silty", "Peaty"];

export default function AdvicePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("crop");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Crop form state
  const [crop, setCrop] = useState("Corn");
  const [stage, setStage] = useState("Vegetative");
  const [location, setLocation] = useState("");
  const [soil, setSoil] = useState("Loamy");
  const [problem, setProblem] = useState("");

  // Disease scan state
  const [scanCrop, setScanCrop] = useState("Corn");
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleCropSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!problem.trim()) { setError("Please describe the problem you're seeing."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop, stage, location, soil, problem }),
      });
      const data = await res.json();
      sessionStorage.setItem("agri_result", JSON.stringify({ type: "advice", input: { crop, stage, location, soil, problem }, ...data }));
      router.push("/results");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDiseaseSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageData) { setError("Please take or upload a photo first."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, cropType: scanCrop }),
      });
      const data = await res.json();
      sessionStorage.setItem("agri_result", JSON.stringify({ type: "diagnosis", cropType: scanCrop, imagePreview, ...data }));
      router.push("/results");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setError("Camera access denied. Please upload a photo instead.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setImagePreview(dataUrl);
    setImageData(dataUrl.split(",")[1]); // base64 only
    stopCamera();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setImageData(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="min-h-screen px-4 py-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="text-[#84cc16]/70 text-sm hover:text-[#84cc16] transition-colors">← Back</Link>
        <h1 className="mt-3 text-2xl font-extrabold text-[#fef9c3]">Get Farm Advice</h1>
        <p className="text-[#fef9c3]/60 text-sm mt-1">Describe your situation or scan a photo for instant help.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["crop", "disease"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(""); }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              tab === t
                ? "bg-[#84cc16] text-[#0c1a00]"
                : "bg-[#0f2200] text-[#fef9c3]/60 border border-[#1a3300] hover:border-[#84cc16]/40"
            }`}
          >
            {t === "crop" ? "CROP ADVICE" : "DISEASE SCAN"}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Crop Advice Tab */}
      {tab === "crop" && (
        <form onSubmit={handleCropSubmit} className="flex flex-col gap-4">
          <Field label="Crop Type">
            <select value={crop} onChange={e => setCrop(e.target.value)} className={selectCls}>
              {CROPS.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Growth Stage">
            <select value={stage} onChange={e => setStage(e.target.value)} className={selectCls}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Your Location">
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City or zip code (e.g. Fresno CA or 93710)"
              className={inputCls}
            />
          </Field>
          <Field label="Soil Type">
            <select value={soil} onChange={e => setSoil(e.target.value)} className={selectCls}>
              {SOILS.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Describe the Problem">
            <textarea
              value={problem}
              onChange={e => setProblem(e.target.value)}
              rows={4}
              placeholder="e.g. My leaves are turning yellow at the edges, started 3 days ago on the lower leaves..."
              className={`${inputCls} resize-none`}
              required
            />
          </Field>
          <SubmitBtn loading={loading} label="Get Advice" />
        </form>
      )}

      {/* Disease Scan Tab */}
      {tab === "disease" && (
        <form onSubmit={handleDiseaseSubmit} className="flex flex-col gap-4">
          <Field label="Crop Type">
            <select value={scanCrop} onChange={e => setScanCrop(e.target.value)} className={selectCls}>
              {CROPS.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Plant Photo">
            <div className="flex flex-col gap-3">
              {/* Camera */}
              {cameraActive ? (
                <div className="relative rounded-xl overflow-hidden bg-black">
                  {/* ponytail: autoPlay/playsInline needed for mobile camera */}
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl" />
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3">
                    <button type="button" onClick={capturePhoto} className="bg-[#84cc16] text-[#0c1a00] font-bold px-6 py-2 rounded-full text-sm">
                      Capture
                    </button>
                    <button type="button" onClick={stopCamera} className="bg-white/20 text-white px-4 py-2 rounded-full text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Captured plant" className="w-full rounded-xl object-cover max-h-64" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setImageData(null); }}
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full"
                  >
                    Retake
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex-1 flex flex-col items-center gap-2 py-6 bg-[#0f2200] border border-[#1a3300] rounded-xl text-[#84cc16] hover:border-[#84cc16]/60 transition-colors text-sm font-medium"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                    </svg>
                    Use Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex flex-col items-center gap-2 py-6 bg-[#0f2200] border border-[#1a3300] rounded-xl text-[#f59e0b] hover:border-[#f59e0b]/60 transition-colors text-sm font-medium"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    Upload Photo
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </Field>

          <SubmitBtn loading={loading} label="Scan for Disease" />
        </form>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#fef9c3]/80 text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 w-full py-4 bg-[#84cc16] text-[#0c1a00] font-bold text-base rounded-xl hover:bg-[#a3e635] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Analyzing...
        </span>
      ) : label}
    </button>
  );
}

const inputCls = "w-full bg-[#0f2200] border border-[#1a3300] rounded-xl px-4 py-3 text-[#fef9c3] placeholder-[#fef9c3]/30 focus:outline-none focus:border-[#84cc16]/60 transition-colors text-sm";
const selectCls = `${inputCls} cursor-pointer`;
