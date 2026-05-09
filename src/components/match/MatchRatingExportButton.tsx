"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImageDown } from "lucide-react";
import {
  buildHtmlToImageOptions,
  canvasToPngDataUrl,
  downloadDataUrl,
} from "@/lib/captureSharePoster";
import { toCanvas } from "html-to-image";
import type { LineupStructure, Player } from "@/types";
import { MatchRatingPoster, type MatchRatingPosterGroup } from "@/components/match/MatchRatingPoster";

const GROUPS: Array<{ id: MatchRatingPosterGroup; suffix: string }> = [
  { id: "goalies", suffix: "1-brankari" },
  { id: "defense", suffix: "2-obrana" },
  { id: "forwards-12", suffix: "3-utok-1-2" },
  { id: "forwards-34", suffix: "4-utok-3-4" },
];

type RatingMap = Record<string, { avg: number; count: number } | undefined>;
type MyMap = Record<string, number | undefined>;

export function MatchRatingExportButton({
  matchTitle,
  startsAtLabel,
  matchSlug,
  lineup,
  players,
  defenseCount,
  allowExtraForward,
  ratings,
  myRatings,
  preferMine = false,
}: {
  matchTitle: string;
  startsAtLabel?: string;
  matchSlug: string;
  lineup: LineupStructure;
  players: Player[];
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  ratings: RatingMap;
  myRatings: MyMap;
  preferMine?: boolean;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);

  const exportAll = async () => {
    if (busy) return;
    const stage = stageRef.current;
    if (!stage) return;
    setBusy(true);
    try {
      const targets = stage.querySelectorAll<HTMLDivElement>(".match-rating-poster");
      if (targets.length !== GROUPS.length) {
        toast.error("Plakát se nepřipravil. Zkus to ještě jednou.");
        return;
      }
      for (let i = 0; i < targets.length; i++) {
        const node = targets[i]!;
        const opts = await buildHtmlToImageOptions(node, {
          backgroundColor: "#05080f",
          pixelRatio: 2,
        });
        const canvas = await toCanvas(node, opts);
        const dataUrl = canvasToPngDataUrl(canvas);
        const filename = `hodnoceni-${matchSlug}-${GROUPS[i]!.suffix}.png`;
        downloadDataUrl(dataUrl, filename);
        await new Promise((r) => setTimeout(r, 450));
      }
      toast.success("Staženo 4 obrázků.");
    } catch (e) {
      console.error("export hodnocení:", e);
      toast.error("Export se nepovedl.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => void exportAll()}
        className="inline-flex items-center gap-2 rounded-xl border border-[#f1c40f]/40 bg-gradient-to-b from-[#f1c40f]/15 to-[#f1c40f]/5 px-4 py-2 font-display text-sm font-black uppercase tracking-wide text-[#f1e6a8] hover:from-[#f1c40f]/25 hover:to-[#f1c40f]/10 disabled:opacity-50"
      >
        <ImageDown className="h-4 w-4" aria-hidden />
        {busy ? "Exportuji…" : "Stáhnout fotky (4×)"}
      </button>

      {/**
       * Off-screen stage — pozičně mimo viewport, ale měřitelná pro html-to-image.
       * Necháme ji v DOM trvale, aby capture nemusel čekat na re-render.
       */}
      <div
        ref={stageRef}
        aria-hidden
        style={{
          position: "fixed",
          top: -100000,
          left: -100000,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        {GROUPS.map((g) => (
          <MatchRatingPoster
            key={g.id}
            matchTitle={matchTitle}
            startsAtLabel={startsAtLabel}
            group={g.id}
            players={players}
            lineup={lineup}
            defenseCount={defenseCount}
            allowExtraForward={allowExtraForward}
            ratings={ratings}
            myRatings={myRatings}
            preferMine={preferMine}
          />
        ))}
      </div>
    </>
  );
}
