"use client";

import { useState } from "react";
import type { Player } from "@/types";
import { PremiumJerseySlotCard } from "@/components/sestava/PremiumJerseySlotCard";

const MOCK_FILLED: Player = {
  id: "preview-1",
  name: "David Pastrňák",
  position: "F",
  role: "RW",
  club: "Boston",
  league: "NHL",
  jerseyNumber: 88,
};

export function JerseyPreviewClient() {
  const [selectedDemo, setSelectedDemo] = useState(false);
  const [dragDemo, setDragDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#05080f] px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center sm:text-left">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-[#c8102e]/90">
            Náhled · MOJE SESTAVA
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
            Prémiová karta slotu (dres)
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
            Nový vizuál jen pro posouzení — zatím není zapojený do editoru. Najezdi myší na kartu pro hover (scale, glow,
            zvednutí). Prázdný slot má čárkovaný obrys a velkou značku pozice uprostřed.
          </p>
          <p className="mt-2 font-mono text-xs text-white/35">
            URL: <span className="text-sky-300/90">/jersey-preview</span>
          </p>
        </header>

        <section className="mb-14 rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:p-8">
          <h2 className="mb-6 font-display text-sm font-bold uppercase tracking-[0.2em] text-white/80">
            Základní srovnání
          </h2>
          <div className="flex flex-col items-center justify-center gap-12 sm:flex-row sm:items-start sm:gap-16">
            <div className="flex flex-col items-center gap-3">
              <PremiumJerseySlotCard
                player={MOCK_FILLED}
                positionLabel="RW"
                onClear={() => {}}
              />
              <span className="text-center text-xs text-white/45">Obsazený slot</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <PremiumJerseySlotCard player={null} positionLabel="C" emptyPlaceholder="C" />
              <span className="text-center text-xs text-white/45">Prázdný slot</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 sm:p-8">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-white/80">
            Stavy (bez myši)
          </h2>
          <p className="mb-6 text-sm text-white/50">
            Simulace výběru slotu a cíle při přetahování hráče — zlatý lem a vnitřní jemný glow.
          </p>
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={selectedDemo}
                onChange={(e) => setSelectedDemo(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/10"
              />
              Vybraný slot
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={dragDemo}
                onChange={(e) => setDragDemo(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/10"
              />
              Drag &amp; drop cíl
            </label>
          </div>
          <div className="flex justify-center">
            <PremiumJerseySlotCard
              player={MOCK_FILLED}
              positionLabel="LW"
              isSelected={selectedDemo}
              isDragOver={dragDemo}
              onClear={() => {}}
              disableMotion
            />
          </div>
        </section>
      </div>
    </div>
  );
}
