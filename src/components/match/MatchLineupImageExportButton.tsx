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
import { MatchLineupJerseyExportPoster } from "@/components/match/MatchLineupJerseyExportPoster";
import { MatchLineupNamesFullPoster } from "@/components/match/MatchFixtureNamesFullPoster";
import { MatchPosterExportChoicesModal } from "@/components/match/MatchPosterExportChoicesModal";
import type { MatchLineupPosterGroup } from "@/lib/matchLineupPosterSegments";

const SEGMENTS: MatchLineupPosterGroup[] = ["line-1", "line-2", "line-3", "line-4"];

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

function filenameLineupSlot(slot: string, baseSlug: string): string {
  if (slot === "cele-jmena") return `sestava-zapas-jmena-${baseSlug}-komplet.png`;
  const map: Record<string, string> = {
    "line-1": "1-lajna",
    "line-2": "2-lajna",
    "line-3": "3-lajna",
    "line-4": "4-lajna",
  };
  const suf = map[slot] ?? slot;
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

  useEffect(() => {
    if (disabled) setModalOpen(false);
  }, [disabled, setModalOpen]);

  const choices = useMemo(
    () => [
      {
        key: "cele-jmena",
        title: "Celá sestava — jen jména",
        hint: "Jako grafika „jen jména“ v editoru nominace (tmavý plakát, celá soupiska).",
      },
      {
        key: "line-1",
        title: "Dresy — 1. lajna",
        hint: "3× útočník + 2× obránce + 1. gólman.",
      },
      {
        key: "line-2",
        title: "Dresy — 2. lajna",
        hint: "3× útočník + 2× obránce.",
      },
      {
        key: "line-3",
        title: "Dresy — 3. lajna",
        hint: "3× útočník + 2× obránce.",
      },
      {
        key: "line-4",
        title: "Dresy — 4. lajna",
        hint: "3× útočník + 2× obránce + 13. útočník (pokud je povolen) + 2. gólman.",
      },
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
        const bg = slot === "cele-jmena" ? "#060b14" : "#05080f";
        const selector =
          slot === "cele-jmena"
            ? "[data-export-slot=\"cele-jmena\"].match-lineup-names-full-poster"
            : `[data-export-slot="${slot}"].match-lineup-jersey-export-poster`;
        const node = stage.querySelector<HTMLElement>(selector);
        if (!node) {
          toast.error("Vybraný výřez nebyl v DOM připraven — zkus ještě jednou.");
          return;
        }
        const opts = await buildHtmlToImageOptions(node, {
          backgroundColor: bg,
          pixelRatio: 2,
        });
        const canvas = await toCanvas(node, opts);
        downloadDataUrl(canvasToPngDataUrl(canvas), filenameLineupSlot(slot, baseSlug));
        toast.success("Staženo 1 PNG.");
      } catch (e) {
        console.error("export match lineup:", e);
        toast.error("Export se nepovedl.");
      } finally {
        setBusyKey(null);
      }
    },
    [baseSlug]
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
        eyebrow="Sestava na zápas"
        title="Generovat plakát"
        description="Stejný princip jako u hodnocení zápasu: nejdřív celá soupiska jen jména, pak řezy po skupinách (G, D, útok). Vždy jedna PNG."
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
        <MatchLineupNamesFullPoster
          headline={titleLine}
          lineup={lineup}
          players={players}
          defenseCount={defenseCount}
          allowExtraForward={allowExtraForward}
          siteUrl={siteOrigin}
          footerInstantIso={footerIso}
        />
        {SEGMENTS.map((g) => (
          <MatchLineupJerseyExportPoster
            key={g}
            lineupTitle={titleLine}
            group={g}
            players={players}
            lineup={lineup}
            defenseCount={defenseCount}
            allowExtraForward={allowExtraForward}
          />
        ))}
      </div>
    </>
  );
}
