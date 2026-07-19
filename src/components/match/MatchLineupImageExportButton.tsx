"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Share2 } from "lucide-react";
import {
  captureElementToCanvas,
  canvasToPngDataUrl,
  downloadDataUrl,
  letterboxCanvas,
  resizeCanvasTo,
} from "@/lib/captureSharePoster";
import { ensureFreshPosterIceBackground } from "@/lib/posterRosterIceBg";
import { SHARE_POSTER_4X5_H, SHARE_POSTER_4X5_W, SHARE_POSTER_CAPTURE_PIXEL_RATIO } from "@/lib/sharePosterLayout";
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

type PosterPreview = {
  dataUrl: string;
  light: boolean;
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
  const previewRunRef = useRef(0);
  const posterPreviewsRef = useRef<Record<string, PosterPreview>>({});
  const previewSignatureRef = useRef("");
  const stageCaptureCountRef = useRef(0);
  const stageRestoreRef = useRef<{
    top: string;
    left: string;
    opacity: string;
    visibility: string;
    zIndex: string;
  } | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [previewsBusy, setPreviewsBusy] = useState(false);
  const [modalOpenInternal, setModalOpenInternal] = useState(false);
  const [posterPreviews, setPosterPreviews] = useState<Record<string, PosterPreview>>({});
  const controlled = typeof modalOpenControlled === "boolean" && typeof onModalOpenChange === "function";
  const modalOpen = controlled ? modalOpenControlled : modalOpenInternal;
  const setModalOpen = controlled ? onModalOpenChange! : setModalOpenInternal;

  const titleLine = shareTitle.trim() || "Moje sestava na zápas";
  const baseSlug = useMemo(() => slugifyForFile(shareSlug ?? shareTitle), [shareSlug, shareTitle]);
  const previewSignature = useMemo(
    () =>
      JSON.stringify({
        titleLine,
        lineup,
        players: players.map(({ id, name, jerseyNumber, position }) => ({ id, name, jerseyNumber, position })),
        defenseCount,
        allowExtraForward,
        ratingSnapshot,
      }),
    [titleLine, lineup, players, defenseCount, allowExtraForward, ratingSnapshot]
  );

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

  useEffect(() => {
    if (!modalOpen) {
      previewRunRef.current += 1;
      setPreviewsBusy(false);
    }
  }, [modalOpen]);

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
          : "Jména celé sestavy na červeno-modrém pozadí — brankáři, obránci a útočníci, formát 4:5.",
      },
      {
        key: "cele-dresy",
        title: "Celá sestava — dresy",
        hint:
          "Kompletní soupiska s dresy — mřížka 2×3 (gólmani, 4 lajny po 3+2), formát 4:5 pro Instagram." +
          ratingHint,
      },
      {
        key: "line-1",
        title: ratingSnapshot ? "Hodnocení — 1. lajna" : "Dresy — 1. lajna",
        hint: ratingSnapshot
          ? "Šablona ledu z editoru — dresy ve štítech, jména a známky pod nimi."
          : "Šablona ledu z editoru — dresy a čísla ve štítech, jména pod sloty.",
      },
      {
        key: "line-2",
        title: ratingSnapshot ? "Hodnocení — 2. lajna" : "Dresy — 2. lajna",
        hint: ratingSnapshot
          ? "Šablona ledu z editoru — dresy ve štítech, jména a známky pod nimi."
          : "Šablona ledu z editoru — dresy a čísla ve štítech.",
      },
      {
        key: "line-3",
        title: ratingSnapshot ? "Hodnocení — 3. lajna" : "Dresy — 3. lajna",
        hint: ratingSnapshot
          ? "Šablona ledu z editoru — dresy ve štítech, jména a známky pod nimi."
          : "Šablona ledu z editoru — dresy a čísla ve štítech.",
      },
      {
        key: "line-4",
        title: ratingSnapshot ? "Hodnocení — 4. lajna" : "Dresy — 4. lajna",
        hint: ratingSnapshot
          ? "Šablona ledu z editoru — dresy ve štítech; dole 13. útočník a 2. gólman."
          : "Šablona ledu z editoru — dresy ve štítech; dole 13. útočník a 2. gólman (pokud jsou v sestavě).",
      },
    ];
    return all;
  }, [ratingSnapshot, ratingHint]);

  const capturePoster = useCallback(
    async (slot: string, previewOnly: boolean) => {
      const stage = stageRef.current;
      if (!stage) {
        throw new Error("Export stage nebyl nalezen.");
      }

      const bg =
        slot === "cele-jmena"
          ? "#060b14"
          : slot === "cele-dresy"
            ? "#ffffff"
            : "#05080f";
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
        throw new Error(`Plakát ${slot} nebyl v DOM připraven.`);
      }

      if (stageCaptureCountRef.current === 0) {
        stageRestoreRef.current = {
          top: stage.style.top,
          left: stage.style.left,
          opacity: stage.style.opacity,
          visibility: stage.style.visibility,
          zIndex: stage.style.zIndex,
        };
        stage.style.top = "0";
        stage.style.left = "0";
        stage.style.opacity = "1";
        stage.style.visibility = "visible";
        stage.style.zIndex = "-9999";
        stage.style.pointerEvents = "none";
      }
      stageCaptureCountRef.current += 1;

      try {
        if (slot === "cele-dresy") {
          await ensureFreshPosterIceBackground(node);
        }
        const imgs = node.querySelectorAll("img");
        await Promise.all(
          [...imgs].map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.addEventListener("load", () => resolve(), { once: true });
                  img.addEventListener("error", () => resolve(), { once: true });
                })
          )
        );

        const lineupLine4x5 = slot.startsWith("line-");
        const lineupNames4x5 = slot === "cele-jmena" && !ratingSnapshot;
        const captureScale = previewOnly
          ? 0.5
          : slot === "cele-dresy" || lineupNames4x5 || lineupLine4x5
            ? 1
            : SHARE_POSTER_CAPTURE_PIXEL_RATIO;
        const canvas = await captureElementToCanvas(node, {
          scale: captureScale,
          backgroundColor: bg,
        });
        let out = canvas;
        if (previewOnly) {
          out =
            slot === "cele-dresy" || lineupNames4x5 || lineupLine4x5
              ? resizeCanvasTo(canvas, 480, 600)
              : letterboxCanvas(canvas, 480, 600, { theme: "dark" });
        } else if (slot === "cele-dresy" || lineupNames4x5 || lineupLine4x5) {
          out = resizeCanvasTo(canvas, SHARE_POSTER_4X5_W, SHARE_POSTER_4X5_H);
        }

        return {
          dataUrl: canvasToPngDataUrl(out),
          filename: filenameLineupSlot(slot, baseSlug, ratingSnapshot),
          light: slot === "cele-dresy",
        };
      } finally {
        stageCaptureCountRef.current = Math.max(0, stageCaptureCountRef.current - 1);
        if (stageCaptureCountRef.current === 0 && stageRestoreRef.current) {
          stage.style.top = stageRestoreRef.current.top;
          stage.style.left = stageRestoreRef.current.left;
          stage.style.opacity = stageRestoreRef.current.opacity;
          stage.style.visibility = stageRestoreRef.current.visibility;
          stage.style.zIndex = stageRestoreRef.current.zIndex;
          stageRestoreRef.current = null;
        }
      }
    },
    [baseSlug, ratingSnapshot]
  );

  useEffect(() => {
    if (!modalOpen || disabled) return;
    if (
      previewSignatureRef.current === previewSignature &&
      choices.every((choice) => posterPreviewsRef.current[choice.key])
    ) {
      setPreviewsBusy(false);
      return;
    }

    const runId = ++previewRunRef.current;
    previewSignatureRef.current = previewSignature;
    posterPreviewsRef.current = {};
    setPosterPreviews({});
    setPreviewsBusy(true);

    void (async () => {
      try {
        let failures = 0;
        await Promise.all(
          choices.map(async (choice) => {
            try {
              const preview = await capturePoster(choice.key, true);
              if (previewRunRef.current !== runId) return;
              const next = {
                ...posterPreviewsRef.current,
                [choice.key]: { dataUrl: preview.dataUrl, light: preview.light },
              };
              posterPreviewsRef.current = next;
              setPosterPreviews(next);
            } catch (error) {
              failures += 1;
              console.error(`poster preview ${choice.key}:`, error);
            }
          })
        );
        if (failures > 0 && previewRunRef.current === runId) {
          toast.error("Některé náhledy se nepodařilo připravit.");
        }
      } finally {
        if (previewRunRef.current === runId) setPreviewsBusy(false);
      }
    })();

    return () => {
      if (previewRunRef.current === runId) previewRunRef.current += 1;
    };
  }, [capturePoster, choices, disabled, modalOpen, previewSignature]);

  const runExport = useCallback(
    async (slot: string) => {
      setBusyKey(slot);
      try {
        const poster = await capturePoster(slot, false);
        downloadDataUrl(poster.dataUrl, poster.filename);
        toast.success("PNG bylo staženo.");
      } catch (e) {
        console.error("export match lineup:", e);
        toast.error(
          "Export se nepovedl. Na mobilu zkus zavřít jiné karty nebo obnovit stránku a stáhnout znovu."
        );
      } finally {
        setBusyKey(null);
      }
    },
    [capturePoster]
  );

  return (
    <>
      {showTriggerButton ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setModalOpen(true)}
          className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-sky-300/55 bg-gradient-to-r from-sky-500/25 via-cyan-400/20 to-sky-500/25 px-6 py-4 font-display text-lg font-black uppercase tracking-[0.08em] text-white shadow-[0_0_0_1px_rgba(125,211,252,0.22),0_18px_60px_rgba(0,180,255,0.18)] transition hover:brightness-110 hover:shadow-[0_0_0_1px_rgba(125,211,252,0.35),0_24px_80px_rgba(0,180,255,0.22)] disabled:opacity-50 sm:py-5"
        >
          <Share2 className="h-6 w-6 shrink-0 text-cyan-100" aria-hidden />
          Plakáty / grafika
        </button>
      ) : null}

      <MatchPosterExportChoicesModal
        open={modalOpen && !disabled}
        onClose={() => setModalOpen(false)}
        eyebrow={ratingSnapshot ? "Hodnocení zápasu" : "Sestava na zápas"}
        title="Export grafiky"
        description={
          ratingSnapshot
            ? "Všechny varianty máš rovnou před sebou. Vyber si plakát a stáhni hotové PNG."
            : "Zde si můžete vybrat z několika verzí plakátů Vaší sestavy, které si můžete stáhnout ve formátu .png (4:5)."
        }
        busyKey={busyKey}
        previewsBusy={previewsBusy}
        choices={choices.map((choice) => ({
          ...choice,
          previewDataUrl: posterPreviews[choice.key]?.dataUrl,
          previewLight: posterPreviews[choice.key]?.light,
        }))}
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
            siteUrl={siteOrigin}
            jerseyRatingExport={jerseyRatingExport}
          />
        ))}
      </div>
    </>
  );
}
