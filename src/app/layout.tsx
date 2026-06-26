import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "AgriAI — Your AI Agronomist",
  description: "Pro-level crop, soil, and weather advice for small family farms. Free AI agronomist in your pocket.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0c1a00] text-[#fef9c3] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
