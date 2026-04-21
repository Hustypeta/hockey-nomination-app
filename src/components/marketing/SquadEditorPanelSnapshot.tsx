"use client";

import { useCallback } from "react";
import { LineBuilder } from "@/components/LineBuilder";
import { PROMO_FB_CAPTAIN_ID, PROMO_FB_LINEUP, PROMO_FB_PLAYERS } from "@/lib/promoFbCoverData";

/** Statický náhled „Moje sestava“ (NHL25) — stejné jako editor na /sestava; bez DnD. */
export function SquadEditorPanelSnapshot() {
  const noop = useCallback(() => {}, []);

  return (
    <div className="nhl25-moje-sestava-panel rounded-2xl p-3.5 sm:p-5">
      <div className="nhl25-moje-sestava-accent mb-3" aria-hidden />
      <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#003087]">Soupiska</p>
      <h2 className="mt-1 font-sans text-xl font-bold leading-snug tracking-normal text-slate-900 sm:text-2xl">
        Moje sestava
      </h2>
      <div className="mt-4">
        <LineBuilder
          lineup={PROMO_FB_LINEUP}
          players={PROMO_FB_PLAYERS}
          captainId={PROMO_FB_CAPTAIN_ID}
          onLineupChange={noop}
          onCaptainChange={noop}
          onSelectSlot={noop}
          selectedSlot={null}
          enableDnd={false}
          layoutVariant="nhl25"
        />
      </div>
    </div>
  );
}
