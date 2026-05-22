"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Share2 } from "lucide-react";
import {
  captureElementToCanvas,
  downloadCanvasPng,
  letterboxCanvas,
  preparePosterCapture,
} from "@/lib/captureSharePoster";
import { SHARE_POSTER_3X4_H, SHARE_POSTER_3X4_W, SHARE_POSTER_CAPTURE_PIXEL_RATIO } from "@/lib/sharePosterLayout";
import type { LineupStructure, Player } from "@/types";
import { MatchLineupJerseyExportPoster } from "@/components/match/MatchLineupJerseyExportPoster";
import { MatchLineupFullJerseyExportPoster } from "@/components/match/MatchLineupFullJerseyExportPoster";
import { MatchPowerPlayExportPoster } from "@/components/match/MatchPowerPlayExportPoster";
import { MatchLineupNamesFullPoster, MatchRatingNamesFullPoster } from "@/components/match/MatchFixtureNamesFullPoster";
import { MatchPosterExportChoicesModal } from "@/components/match/MatchPosterExportChoicesModal";
import type { MatchLineupPosterGroup } from "@/lib/matchLineupPosterSegments";
import { POWER_PLAY_UI_ENABLED } from "@/lib/powerPlayLineup";
import type { MatchRatingAggregateMap, MatchRatingMyMap } from "@/lib/matchRatingExportDisplay";

const SEGMENTS: MatchLineupPosterGroup[] = ["line-1", "line-2", "line-3", "line-4"];

export type MatchLineupImageRatingSnapshot = {
  ratings: MatchRatingAggregateMap;
  myRatings: MatchRatingMyMap;
  mode: "personal" | "community";
};

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

function filenameLineupSlot(slot: string, baseSlug: string, snap: MatchLineupImageRatingSnapshot | undefined): string {
  const modeTag = snap ? (snap.mode === "personal" ? "-moje" : "-komunita") : "";
  if (slot === "power-play") return `sestava-zapas-presilovka-${baseSlug}.png`;
  if (slot === "cele-jmena") return `sestava-zapas-jmena-${baseSlug}-komplet.png`;
  if (slot === "cele-dresy") {
    return snap
      ? `hodnoceni-zapas-dresy-${baseSlug}-komplet${modeTag}.png`
      : `sestava-zapas-dresy-${baseSlug}-komplet.png`;
  }
  const map: Record<string, string> = {
    "line-1": "1-lajna",
    "line-2": "2-lajna",
    "line-3": "3-lajna",
    "line-4": "4-lajna",
  };
  const suf = map[slot] ?? slot;
  if (snap) return `hodnoceni-zapas-${baseSlug}-${suf}${modeTag}.png`;
  return `sestava-zapas-dresy-${baseSlug}-${suf}.png`;
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
  /** Řízené otevření modalu (např. ze spodní lišty). */
  modalOpen: modalOpenControlled,
  onModalOpenChange,
  showTriggerButton = true,
  /** Zobrazení známek na dresových plakátech (modal hodnocení + stejný režim jako u odkazu). */
  ratingSnapshot,
}: {
  shareTitle: string;
  lineup: LineupStructure;
  players: Player[];
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  shareSlug?: string | null;
  siteOrigin: string;
  disabled?: boolean;
  modalOpen?: boolean;
  onModalOpenChange?: (open: boolean) => void;
  showTriggerButton?: boolean;
  ratingSnapshot?: MatchLineupImageRatingSnapshot;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [modalOpenInternal, setModalOpenInternal] = useState(false);
  const controlled = typeof modalOpenControlled === "boolean" && typeof onModalOpenChange === "function";
  const modalOpen = controlled ? modalOpenControlled : modalOpenInternal;
  const setModalOpen = controlled ? onModalOpenChange! : setModalOpenInternal;

  const titleLine = shareTitle.trim() || "Moje sestava na zápas";
  const baseSlug = useMemo(() => slugifyForFile(shareSlug ?? shareTitle), [shareSlug, shareTitle]);

  const footerIso = useMemo(() => new Date().toISOString(), []);

  const jerseyRatingExport = ratingSnapshot
    ? {
        ratings: ratingSnapshot.ratings,
        myRatings: ratingSnapshot.myRatings,
        snapshotMode: ratingSnapshot.mode,
      }
    : undefined;

  const ratingHint =
    ratingSnapshot != null
      ? " Na dresových řezech je u každého hráče známka podle režimu nahoře (moje uložené / průměr komunity)."
      : "";

  useEffect(() => {
    if (disabled) setModalOpen(false);
  }, [disabled, setModalOpen]);

  const choices = useMemo(() => {
    const all = [
      ...(POWER_PLAY_UI_ENABLED
        ? [
            {
              key: "power-play",
              title: "Přesilovka — 2 pětky na ledě",
              hint: "Plakát 3:4 — 1. pětka nahoře, 2. pětka dole, rozestavení 1:3:1 na kluzišti.",
            },
          ]
        : []),
      {
        key: "cele-jmena",
        title: ratingSnapshot ? "Celá sestava — jména a známky" : "Celá sestava — jen jména",
        hint: ratingSnapshot
          ? "Tmavý plakát: brankáři, obrana, útočníci — u každého jména známka (režim nahoře)."
          : "Jako grafika „jen jména“ v editoru nominace (tmavý plakát, celá soupiska).",
      },
      {
        key: "cele-dresy",
        title: "Celá sestava — dresy",
        hint:
          "Kompletní soupiska s dresy (brankáři, 4 lajny, obrana pod počtem beků, případně 13. útočník)." +
          ratingHint,
      },
      {
        key: "line-1",
        title: ratingSnapshot ? "Hodnocení — 1. lajna" : "Dresy — 1. lajna",
        hint: ratingSnapshot
          ? "Formát 3:4 — dresy na ledě, jména a známky jako v editoru sestavy."
          : "Tři útočníci vedle sebe, dva obránci vedle sebe, pod nimi 1. gólman.",
      },
      {
        key: "line-2",
        title: ratingSnapshot ? "Hodnocení — 2. lajna" : "Dresy — 2. lajna",
        hint: ratingSnapshot
          ? "Formát 3:4 — dresy na ledě s hodnocením."
          : "Tři útočníci vedle sebe, dva obránci vedle sebe.",
      },
      {
        key: "line-3",
        title: ratingSnapshot ? "Hodnocení — 3. lajna" : "Dresy — 3. lajna",
        hint: ratingSnapshot
          ? "Formát 3:4 — dresy na ledě s hodnocením."
          : "Tři útočníci vedle sebe, dva obránci vedle sebe.",
      },
      {
        key: "line-4",
        title: ratingSnapshot ? "Hodnocení — 4. lajna" : "Dresy — 4. lajna",
        hint: ratingSnapshot
          ? "Formát 3:4 — dresy na ledě; dole 13. útočník a 2. gólman."
          : "Tři útočníci a dva obránci jako výš; dole vedle sebe 13. útočník a 2. gólman (pokud jsou v sestavě).",
      },
    ];
    return all;
  }, [ratingSnapshot, ratingHint]);

  const runExport = useCallback(
    async (slot: string) => {
      const stage = stageRef.current;
      if (!stage) {
        toast.error("Export nelze najít.");
        return;
      }
      setBusyKey(slot);
      try {
        const bg =
          slot === "cele-jmena" ? "#060b14" : slot === "cele-dresy" ? "#e8ecf2" : "#05080f";
        const selector =
          slot === "power-play"
            ? "[data-export-slot=\"power-play\"].match-power-play-export-poster"
            : slot === "cele-jmena"
              ? ratingSnapshot
                ? "[data-export-slot=\"cele-jmena\"].match-rating-names-full-poster"
                : "[data-export-slot=\"cele-jmena\"].match-lineup-names-full-poster"
              : slot === "cele-dresy"
                ? "[data-export-slot=\"cele-dresy\"].match-lineup-full-jersey-poster"
                : `[data-export-slot="${slot}"].match-lineup-jersey-export-poster`;
        const node = stage.querySelector<HTMLElement>(selector);
        if (!node) {
          toast.error("Vybraný výřez nebyl v DOM připraven — zkus ještě jednou.");
          return;
        }
        const stagePrev = {
          top: stage.style.top,
          left: stage.style.left,
          opacity: stage.style.opacity,
          visibility: stage.style.visibility,
          zIndex: stage.style.zIndex,
        };
        stage.style.top = "0";
        stage.style.left = "0";
        stage.style.opacity = "0.001";
        stage.style.visibility = "visible";
        stage.style.zIndex = "-1";
        await preparePosterCapture();
        const prevHeight = node.style.height;
        const prevMaxHeight = node.style.maxHeight;
        const prevOverflow = node.style.overflow;
        const letterboxRatingJerseys = ratingSnapshot && slot === "cele-dresy";
        const letterboxLineJerseys = slot.startsWith("line-");
        if (letterboxRatingJerseys) {
          node.style.height = "auto";
          node.style.maxHeight = "none";
          node.style.overflow = "visible";
        }
        let canvas: HTMLCanvasElement;
        try {
          canvas = await captureElementToCanvas(node, {
            scale: SHARE_POSTER_CAPTURE_PIXEL_RATIO,
            backgroundColor: bg,
          });
        } finally {
          if (letterboxRatingJerseys) {
            node.style.height = prevHeight;
            node.style.maxHeight = prevMaxHeight;
            node.style.overflow = prevOverflow;
          }
        }
        if (letterboxRatingJerseys) {
          canvas = letterboxCanvas(canvas, SHARE_POSTER_3X4_W, SHARE_POSTER_3X4_H, { theme: "light" });
        } else if (letterboxLineJerseys) {
          canvas = letterboxCanvas(canvas, SHARE_POSTER_3X4_W, SHARE_POSTER_3X4_H, { theme: "dark" });
        }
        stage.style.top = stagePrev.top;
        stage.style.left = stagePrev.left;
        stage.style.opacity = stagePrev.opacity;
        stage.style.visibility = stagePrev.visibility;
        stage.style.zIndex = stagePrev.zIndex;
        await downloadCanvasPng(canvas, filenameLineupSlot(slot, baseSlug, ratingSnapshot));
        toast.success("Staženo 1 PNG.");
      } catch (e) {
        console.error("export match lineup:", e);
        toast.error(
          "Export se nepovedl. Na mobilu zkus zavřít jiné karty nebo obnovit stránku a stáhnout znovu."
        );
      } finally {
        const stage = stageRef.current;
        if (stage) {
          stage.style.top = "-100000px";
          stage.style.left = "-100000px";
          stage.style.opacity = "0";
          stage.style.visibility = "";
          stage.style.zIndex = "";
        }
        setBusyKey(null);
      }
    },
    [baseSlug, ratingSnapshot]
  );

  return (
    <>
      {showTriggerButton ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-sky-400/45 bg-sky-500/12 px-4 py-2 text-sm font-bold text-sky-50 hover:bg-sky-500/22 disabled:opacity-50"
        >
          <Share2 className="h-4 w-4 shrink-0" aria-hidden />
          Plakáty / grafika
        </button>
      ) : null}

      <MatchPosterExportChoicesModal
        open={modalOpen && !disabled}
        onClose={() => setModalOpen(false)}
        eyebrow={ratingSnapshot ? "Hodnocení zápasu" : "Sestava na zápas"}
        title="Generovat plakát"
        description={
          ratingSnapshot
            ? "Celá soupiska nebo jednotlivé lajny — jen jména se známkami (3:4). Kompletní sestava s dresy je samostatná volba. Vždy jedna PNG."
            : "Celá soupiska jen jména nebo s dresy, případně řezy po kompletních lajnách (3F + 2D; na 1. lajně 1. gólman, na 4. též 13. útočník a 2. gólman). Vždy jedna PNG."
        }
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
        {ratingSnapshot ? (
          <MatchRatingNamesFullPoster
            headline={titleLine}
            lineup={lineup}
            players={players}
            defenseCount={defenseCount}
            allowExtraForward={allowExtraForward}
            ratings={ratingSnapshot.ratings}
            myRatings={ratingSnapshot.myRatings}
            snapshotMode={ratingSnapshot.mode}
            siteUrl={siteOrigin}
            footerInstantIso={footerIso}
          />
        ) : (
          <MatchLineupNamesFullPoster
            headline={titleLine}
            lineup={lineup}
            players={players}
            defenseCount={defenseCount}
            allowExtraForward={allowExtraForward}
            siteUrl={siteOrigin}
            footerInstantIso={footerIso}
          />
        )}
        <MatchLineupFullJerseyExportPoster
          lineupTitle={titleLine}
          lineup={lineup}
          players={players}
          defenseCount={defenseCount}
          allowExtraForward={allowExtraForward}
          siteUrl={siteOrigin}
          jerseyRatingExport={jerseyRatingExport}
        />
        {POWER_PLAY_UI_ENABLED && !ratingSnapshot ? (
          <MatchPowerPlayExportPoster lineupTitle={titleLine} lineup={lineup} players={players} />
        ) : null}
        {SEGMENTS.map((g) => (
          <MatchLineupJerseyExportPoster
            key={g}
            lineupTitle={titleLine}
            group={g}
            players={players}
            lineup={lineup}
            defenseCount={defenseCount}
            allowExtraForward={allowExtraForward}
            jerseyRatingExport={jerseyRatingExport}
          />
        ))}
      </div>
    </>
  );
}
