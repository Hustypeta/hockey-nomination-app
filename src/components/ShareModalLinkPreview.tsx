"use client";

import { Nhl25SharePoster } from "@/components/Nhl25SharePoster";
import { NamesOnlySharePoster } from "@/components/NamesOnlySharePoster";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";
import type { PosterLetterboxTheme } from "@/lib/captureSharePoster";

type Props = {
  players: Player[];
  lineupStructure: LineupStructure;
  captainId: string | null;
  assistantIds: string[];
  nominationTitle: string;
  posterVariant: "jerseys" | "names";
  posterTheme: PosterLetterboxTheme;
};

/** Zmenšený náhled před generováním PNG — stejná data jako skrytý capture. */
export function ShareModalLinkPreview({
  players,
  lineupStructure,
  captainId,
  assistantIds,
  nominationTitle,
  posterVariant,
  posterTheme,
}: Props) {
  return (
    <div className="relative mx-auto mb-5 h-[200px] w-full max-w-xl overflow-hidden rounded-xl border border-white/[0.12] bg-black/35 shadow-inner">
      <div className="pointer-events-none absolute left-1/2 top-2 w-[920px] origin-top -translate-x-1/2 scale-[0.2]">
        {posterVariant === "jerseys" ? (
          <Nhl25SharePoster
            players={players}
            lineup={lineupStructure}
            captainId={captainId}
            assistantIds={assistantIds}
            nominationTitle={nominationTitle.trim() || null}
            siteUrl=""
            footerInstantIso={null}
            posterTheme={posterTheme}
          />
        ) : (
          <NamesOnlySharePoster
            players={players}
            lineup={lineupStructure}
            nominationTitle={nominationTitle.trim() || null}
            siteUrl=""
            footerInstantIso={null}
          />
        )}
      </div>
      <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-wider text-white/40">
        Náhled pro sociální sítě · po stažení plné rozlišení
      </p>
    </div>
  );
}
