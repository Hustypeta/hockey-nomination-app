"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ImageDown } from "lucide-react";
import {
  buildHtmlToImageOptions,
  canvasToPngDataUrl,
  downloadDataUrl,
} from "@/lib/captureSharePoster";
import { toCanvas } from "html-to-image";
import type { LineupStructure, Player } from "@/types";
import { MatchLineupJerseyExportPoster } from "@/components/match/MatchLineupJerseyExportPoster";
import { MatchLineupNamesSegmentPoster } from "@/components/match/MatchLineupNamesSegmentPoster";
import type { MatchLineupPosterGroup } from "@/lib/matchLineupPosterSegments";

const GROUPS: Array<{ id: MatchLineupPosterGroup; suffix: string }> = [
  { id: "goalies", suffix: "1-brankari" },
  { id: "defense", suffix: "2-obrana" },
  { id: "forwards-12", suffix: "3-utok-1-2" },
  { id: "forwards-34", suffix: "4-utok-3-4" },
];

function slugifyForFile(raw: string): string {
  const s = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return s.length >= 2 ? s : "sestava-zapas";
}

export function MatchLineupImageExportButton({
  shareTitle,
  lineup,
  players,
  defenseCount,
  allowExtraForward,
  shareSlug,
  siteOrigin,
  disabled,
}: {
  shareTitle: string;
  lineup: LineupStructure;
  players: Player[];
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  shareSlug?: string | null;
  siteOrigin: string;
  disabled?: boolean;
}) {
  const jerseyStageRef = useRef<HTMLDivElement | null>(null);
  const namesStageRef = useRef<HTMLDivElement | null>(null);
  const [busyJersey, setBusyJersey] = useState(false);
  const [busyNames, setBusyNames] = useState(false);

  const titleLine = shareTitle.trim() || "Moje sestava na zápas";
  const baseSlug = useMemo(
    () => slugifyForFile(shareSlug ?? shareTitle),
    [shareSlug, shareTitle]
  );

  const exportSegmented = async (
    stage: HTMLDivElement | null,
    className: string,
    filePrefix: string,
    backgroundColor: string,
    setBusy: (v: boolean) => void,
    okMessage: string
  ) => {
    if (!stage) return;
    setBusy(true);
    try {
      const targets = stage.querySelectorAll<HTMLDivElement>(`.${className}`);
      if (targets.length !== GROUPS.length) {
        toast.error("Export se nepřipravil. Zkus to ještě jednou.");
        return;
      }
      for (let i = 0; i < targets.length; i++) {
        const node = targets[i]!;
        const opts = await buildHtmlToImageOptions(node, {
          backgroundColor,
          pixelRatio: 2,
        });
        const canvas = await toCanvas(node, opts);
        const dataUrl = canvasToPngDataUrl(canvas);
        const filename = `${filePrefix}-${baseSlug}-${GROUPS[i]!.suffix}.png`;
        downloadDataUrl(dataUrl, filename);
        await new Promise((r) => setTimeout(r, 450));
      }
      toast.success(okMessage);
    } catch (e) {
      console.error("export match lineup:", e);
      toast.error("Export se nepovedl.");
    } finally {
      setBusy(false);
    }
  };

  const busy = busyJersey || busyNames;
  const footerIso = useMemo(() => new Date().toISOString(), []);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() =>
            void exportSegmented(
              jerseyStageRef.current,
              "match-lineup-jersey-export-poster",
              "sestava-zapas-dresy",
              "#05080f",
              setBusyJersey,
              "Staženo 4 fotek s dresy."
            )
          }
          className="inline-flex items-center gap-2 rounded-xl border border-sky-400/35 bg-sky-500/10 px-3 py-2 text-sm font-bold text-sky-100 hover:bg-sky-500/20 disabled:opacity-50"
        >
          <ImageDown className="h-4 w-4 shrink-0" aria-hidden />
          {busyJersey ? "Exportuji…" : "Fotky s dresy (4×)"}
        </button>
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() =>
            void exportSegmented(
              namesStageRef.current,
              "match-lineup-names-segment-poster",
              "sestava-zapas-jmena",
              "#060b14",
              setBusyNames,
              "Staženo 4 fotek jen s jmény."
            )
          }
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-sm font-bold text-white/90 hover:bg-white/[0.1] disabled:opacity-50"
        >
          <ImageDown className="h-4 w-4 shrink-0" aria-hidden />
          {busyNames ? "Exportuji…" : "Jen jména (4×)"}
        </button>
      </div>

      <div
        ref={jerseyStageRef}
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
          <MatchLineupJerseyExportPoster
            key={`j-${g.id}`}
            lineupTitle={titleLine}
            group={g.id}
            players={players}
            lineup={lineup}
            defenseCount={defenseCount}
            allowExtraForward={allowExtraForward}
          />
        ))}
      </div>

      <div
        ref={namesStageRef}
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
          <MatchLineupNamesSegmentPoster
            key={`n-${g.id}`}
            lineupTitle={titleLine}
            group={g.id}
            players={players}
            lineup={lineup}
            defenseCount={defenseCount}
            allowExtraForward={allowExtraForward}
            siteUrl={siteOrigin}
            footerInstantIso={footerIso}
          />
        ))}
      </div>
    </>
  );
}
