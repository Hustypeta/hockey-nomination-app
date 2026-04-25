"use client";

import { useEffect, useMemo, useState } from "react";
import type { Player, LineupStructure } from "@/types";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SestavaAmbientBackground } from "@/components/sestava/SestavaAmbientBackground";
import { SestavaHero } from "@/components/sestava/SestavaHero";
import { LineBuilder } from "@/components/LineBuilder";
import { initJerseyNameDisambiguation } from "@/lib/jerseyDisplayName";

export function ReadonlySquadBuilderView({
  title,
  players,
  captainId,
  lineupStructure,
}: {
  title?: string | null;
  players: Player[];
  captainId: string | null;
  lineupStructure: LineupStructure;
}) {
  const normalized = useMemo(() => normalizeLineupStructure(lineupStructure), [lineupStructure]);
  const filled = useMemo(
    () =>
      [
        ...normalized.goalies,
        ...normalized.forwardLines.flatMap((l) => [l.lw, l.c, l.rw, l.x]),
        ...normalized.defensePairs.flatMap((p) => [p.lb, p.rb]),
        ...normalized.extraForwards,
        ...normalized.extraDefensemen,
      ].filter(Boolean).length,
    [normalized]
  );

  useEffect(() => {
    initJerseyNameDisambiguation(players);
  }, [players]);

  // Read-only: držíme statický state pro API LineBuilderu, ale nic neměníme.
  const [noopLineup] = useState(normalized);
  const [selectedSlot] = useState<null>(null);

  return (
    <div className="sestava-page-ambient min-h-screen pb-24 text-white">
      <SestavaAmbientBackground />

      <div className="sticky top-0 z-40">
        <SiteHeader />
        <SestavaHero
          filled={filled}
          subtitleCounts={title?.trim() ? `Sdílená nominace: ${title.trim()}` : "Sdílená nominace"}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[90rem] px-3 pb-10 pt-2 sm:px-5 sm:py-6 lg:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="nhl25-moje-sestava-panel rounded-2xl p-3 sm:p-5 lg:p-6">
            <div className="nhl25-moje-sestava-accent mb-2 sm:mb-3" aria-hidden />
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#003087]">Soupiska</p>
            <h2 className="mt-1 font-sans text-xl font-bold leading-snug tracking-normal text-slate-900 sm:text-2xl">
              Moje sestava
            </h2>
            <p className="mt-2 text-xs text-slate-700/80">
              Náhled je pouze pro čtení — tady se sestava neupravuje.
            </p>

            <div className="mt-4">
              <LineBuilder
                lineup={noopLineup}
                players={players}
                captainId={captainId}
                onLineupChange={() => undefined}
                onCaptainChange={() => undefined}
                selectedSlot={selectedSlot}
                onSelectSlot={() => undefined}
                enableDnd={false}
                readOnly
                layoutVariant="nhl25"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

