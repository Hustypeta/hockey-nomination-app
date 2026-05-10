"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Share2 } from "lucide-react";
import {
  buildHtmlToImageOptions,
  canvasToPngDataUrl,
  downloadDataUrl,
} from "@/lib/captureSharePoster";
import { toCanvas } from "html-to-image";
import type { LineupStructure, Player } from "@/types";
import { MATCH_LINEUP_POSTER_GROUP_TITLE, type MatchLineupPosterGroup } from "@/lib/matchLineupPosterSegments";
import { MatchRatingPoster } from "@/components/match/MatchRatingPoster";
import { MatchRatingNamesFullPoster } from "@/components/match/MatchFixtureNamesFullPoster";
import { MatchPosterExportChoicesModal } from "@/components/match/MatchPosterExportChoicesModal";

const SEGMENTS: MatchLineupPosterGroup[] = ["line-1", "line-2", "line-3", "line-4"];

function filenameForRatingSlot(slot: string, matchSlug: string): string {
  if (slot === "cele-jmena") return `hodnoceni-${matchSlug}-cele-jmena.png`;
  const map: Record<string, string> = {
    "line-1": "1-lajna",
    "line-2": "2-lajna",
    "line-3": "3-lajna",
    "line-4": "4-lajna",
  };
  const suf = map[slot] ?? slot;
  return `hodnoceni-${matchSlug}-${suf}.png`;
}

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
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSiteOrigin(window.location.host);
  }, []);

  const footerIso = useMemo(() => new Date().toISOString(), []);

  const choices = useMemo(
    () => [
      {
        key: "cele-jmena",
        title: "Jen jména a průměry fanoušků",
        hint: "Celá soupiska najednou (stejný grafický styl jako „jen jména“ u nominace).",
      },
      ...SEGMENTS.map((g) => ({
        key: g,
        title: `Dresy a hodnocení — ${MATCH_LINEUP_POSTER_GROUP_TITLE[g]}`,
        hint:
          g === "line-1"
            ? "3× útočník + 2× obránce + 1. gólman (stejný řez jako sestava na zápas)."
            : g === "line-4"
              ? "3× útočník + 2× obránce + 13. útočník (pokud je povolen) + 2. gólman."
              : "3× útočník + 2× obránce.",
      })),
    ],
    []
  );

  const runExport = useCallback(
    async (slot: string) => {
      const stage = stageRef.current;
      if (!stage) {
        toast.error("Export nelze najít.");
        return;
      }
      setBusyKey(slot);
      try {
        const selector =
          slot === "cele-jmena"
            ? "[data-export-slot=\"cele-jmena\"].match-rating-names-full-poster"
            : `[data-export-slot="${slot}"].match-rating-poster`;
        const node = stage.querySelector<HTMLElement>(selector);
        if (!node) {
          toast.error("Vybraný výřez nebyl v DOM připraven — zkus ještě jednou.");
          return;
        }
        const opts = await buildHtmlToImageOptions(node, {
          backgroundColor: "#05080f",
          pixelRatio: 2,
        });
        const canvas = await toCanvas(node, opts);
        downloadDataUrl(canvasToPngDataUrl(canvas), filenameForRatingSlot(slot, matchSlug));
        toast.success("Staženo 1 PNG.");
      } catch (e) {
        console.error("export hodnocení:", e);
        toast.error("Export se nepovedl.");
      } finally {
        setBusyKey(null);
      }
    },
    [matchSlug]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-[#f1c40f]/40 bg-gradient-to-b from-[#f1c40f]/15 to-[#f1c40f]/5 px-4 py-2 font-display text-sm font-black uppercase tracking-wide text-[#f1e6a8] hover:from-[#f1c40f]/25 hover:to-[#f1c40f]/10"
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Export grafiky
      </button>

      <MatchPosterExportChoicesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        eyebrow="Hodnocení zápasu"
        title="Stáhnout grafiku hodnocení"
        description="Vždy jen jedna fotka najednou — celá soupiska s průměry, pak řez po řezu jako u sestavy na zápas: kompletní lajny (3F + 2D)."
        busyKey={busyKey}
        choices={choices}
        onPick={async (key) => {
          await runExport(key);
        }}
      />

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
        <MatchRatingNamesFullPoster
          headline={matchTitle}
          subline={startsAtLabel}
          lineup={lineup}
          players={players}
          defenseCount={defenseCount}
          allowExtraForward={allowExtraForward}
          ratings={ratings}
          siteUrl={siteOrigin}
          footerInstantIso={footerIso}
        />
        {SEGMENTS.map((g) => (
          <MatchRatingPoster
            key={g}
            matchTitle={matchTitle}
            startsAtLabel={startsAtLabel}
            group={g}
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
