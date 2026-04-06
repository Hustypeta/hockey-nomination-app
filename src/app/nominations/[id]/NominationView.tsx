"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { NominationPoster } from "@/components/NominationPoster";
import { RosterSheet } from "@/components/RosterSheet";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";

interface NominationViewProps {
  players: Player[];
  captainId: string | null;
  lineupStructure?: LineupStructure | null;
  nominationId: string;
}

export function NominationView({
  players,
  captainId,
  lineupStructure,
  nominationId,
}: NominationViewProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const rosterRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportMode, setExportMode] = useState<"poster" | "roster">("poster");

  const handleDownload = async () => {
    const ref = exportMode === "poster" ? posterRef : rosterRef;
    if (!ref.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ref.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: exportMode === "poster" ? "#0c0e12" : "#ffffff",
      });
      const link = document.createElement("a");
      link.download = exportMode === "poster"
        ? `ms2026-nominace-${nominationId}.png`
        : `ms2026-soupiska-${nominationId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/nominations/${nominationId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0c0e12]">
      <header className="border-b border-[#2a3142] bg-[#151922]/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="font-display text-4xl text-white tracking-wider">
            MS 2026
          </h1>
          <p className="text-[#c41e3a] font-display text-xl mt-1">
            Má nominace
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-2 justify-center mb-4">
          <button
            onClick={() => setExportMode("poster")}
            className={`px-4 py-2 rounded-lg font-display transition-all ${
              exportMode === "poster"
                ? "bg-[#c41e3a] text-white"
                : "bg-[#2a3142] text-white/70 hover:text-white"
            }`}
          >
            Plakát
          </button>
          <button
            onClick={() => setExportMode("roster")}
            className={`px-4 py-2 rounded-lg font-display transition-all ${
              exportMode === "roster"
                ? "bg-[#c41e3a] text-white"
                : "bg-[#2a3142] text-white/70 hover:text-white"
            }`}
          >
            Soupiska
          </button>
        </div>

        <div className="flex justify-center mb-8">
          {exportMode === "poster" ? (
            <NominationPoster
              ref={posterRef}
              players={players}
              captainId={captainId}
              lineup={lineupStructure}
            />
          ) : (
            <RosterSheet
              ref={rosterRef}
              players={players}
              captainId={captainId}
              lineup={lineupStructure}
            />
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-3 rounded-xl bg-[#c41e3a] text-white font-display text-lg hover:bg-[#a01830] disabled:opacity-50 transition-all card-glow"
          >
            {downloading ? "Generuji..." : "Stáhnout plakát"}
          </button>
          <button
            onClick={handleCopyLink}
            className="px-6 py-3 rounded-xl border-2 border-[#2a3142] text-white hover:border-[#c41e3a] transition-all flex items-center justify-center gap-2"
          >
            {copied ? (
              "Zkopírováno!"
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Kopírovat odkaz
              </>
            )}
          </button>
        </div>

        <p className="text-white/50 text-sm text-center mt-4">
          Sdílej odkaz – při vložení na Facebook, Twitter nebo WhatsApp se zobrazí hezký náhled plakátu.
        </p>

        <a
          href="/"
          className="block text-center text-[#c41e3a] hover:underline mt-8"
        >
          ← Sestav si vlastní nominaci
        </a>
      </main>
    </div>
  );
}
