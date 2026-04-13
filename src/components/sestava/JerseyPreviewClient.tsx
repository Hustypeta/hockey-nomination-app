"use client";

import { useState } from "react";
import type { Player } from "@/types";
import { PremiumJerseySlotCard } from "@/components/sestava/PremiumJerseySlotCard";
import { SitePageHero } from "@/components/site/SitePageHero";

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
    <div className="pb-16 pt-2 text-white">
      <SitePageHero
        kicker="Náhled · MOJE SESTAVA"
        title="Prémiová karta slotu (dres)"
        subtitle="Nový vizuál jen pro posouzení — zatím není zapojený do editoru. Najezdi myší na kartu pro hover (scale, glow, zvednutí). Prázdný slot má čárkovaný obrys a velkou značku pozice uprostřed."
        align="center"
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="mb-10 text-center font-mono text-xs text-white/35">
          URL: <span className="text-sky-300/90">/jersey-preview</span>
        </p>

        <section className="sestava-premium-panel-dark mb-12 rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
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

        <section className="sestava-premium-panel-dark rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
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
