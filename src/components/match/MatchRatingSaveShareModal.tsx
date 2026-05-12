"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, X } from "lucide-react";
import type { LineupStructure, Player } from "@/types";
import { MatchRatingExportButton } from "@/components/match/MatchRatingExportButton";

export function MatchRatingSaveShareModal({
  open,
  onClose,
  matchTitle,
  startsAtLabel,
  matchSlug,
  lineup,
  players,
  defenseCount,
  allowExtraForward,
  ratings,
  myRatings,
}: {
  open: boolean;
  onClose: () => void;
  matchTitle: string;
  startsAtLabel?: string;
  matchSlug: string;
  lineup: LineupStructure;
  players: Player[];
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  ratings: Record<string, { avg: number; count: number } | undefined>;
  myRatings: Record<string, number | undefined>;
}) {
  const [title, setTitle] = useState(`Hodnocení — ${matchTitle}`);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [snapshotMode, setSnapshotMode] = useState<"personal" | "community">("personal");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const createLink = async () => {
    setBusy(true);
    try {
      const r = await fetch("/api/match-rating-share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchSlug, title, snapshotMode }),
      });
      const data: unknown = await r.json().catch(() => ({}));
      const err = (data as { error?: unknown } | null)?.error;
      if (!r.ok) {
        toast.error(typeof err === "string" ? err : "Export se nepovedl.");
        return;
      }
      const nextUrl = (data as { url?: unknown } | null)?.url;
      if (typeof nextUrl === "string" && nextUrl) {
        setUrl(nextUrl);
        await navigator.clipboard.writeText(nextUrl).catch(() => undefined);
        toast.success("Odkaz zkopírován do schránky.");
      } else {
        toast.success("Export vytvořen.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sdílení hodnocení zápasu"
        className="max-h-[min(92vh,760px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/12 bg-[#0b1220] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Sdílení</p>
            <h2 className="mt-1 font-display text-lg font-black text-white">Odkaz & export grafiky</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08] disabled:opacity-50"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">Vytvořit odkaz</p>
            <fieldset className="mt-3 space-y-2 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
              <legend className="sr-only">Co odkaz vyexportuje</legend>
              <label className="flex cursor-pointer gap-2 text-white/82">
                <input
                  type="radio"
                  name="rating-export-mode-modal"
                  checked={snapshotMode === "personal"}
                  onChange={() => setSnapshotMode("personal")}
                  className="mt-1"
                />
                <span>
                  <span className="font-bold text-emerald-200">Moje uložené známky</span>
                  <span className="mt-1 block text-xs font-normal leading-snug text-white/55">
                    Přesně to, co máš u zápasu potvrzené pod účtem.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer gap-2 text-white/82">
                <input
                  type="radio"
                  name="rating-export-mode-modal"
                  checked={snapshotMode === "community"}
                  onChange={() => setSnapshotMode("community")}
                  className="mt-1"
                />
                <span>
                  <span className="font-bold text-amber-100">Průměry komunity</span>
                  <span className="mt-1 block text-xs font-normal leading-snug text-white/55">
                    Agregované průměry ze všech hlasů v době vytvoření odkazu.
                  </span>
                </span>
              </label>
            </fieldset>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-[#00B4FF]/45 focus:ring-1 focus:ring-[#00B4FF]/30"
              placeholder="Název exportu (volitelné)"
            />

            {url ? (
              <div className="mt-3 break-all rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/80">
                {url}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void createLink()}
                className="rounded-xl bg-gradient-to-r from-[#003087] to-[#c8102e] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"
              >
                {busy ? "Vytvářím…" : "Vytvořit odkaz"}
              </button>
              {url ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(url);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 900);
                      toast.success("Odkaz zkopírován do schránky.");
                    } catch {
                      toast.error("Nepodařilo se zkopírovat.");
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm font-black text-white/85 hover:bg-white/[0.08]"
                >
                  <Copy className="h-4 w-4" aria-hidden />
                  {copied ? "Zkopírováno" : "Kopírovat"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">Export grafiky</p>
            <p className="mt-1 text-xs text-white/60">
              Stejné řezy jako u sestavy na zápas (celá soupiska jen jména, pak lajny).
            </p>
            <div className="mt-3">
              <MatchRatingExportButton
                matchTitle={matchTitle}
                startsAtLabel={startsAtLabel}
                matchSlug={matchSlug}
                lineup={lineup}
                players={players}
                defenseCount={defenseCount}
                allowExtraForward={allowExtraForward}
                ratings={ratings}
                myRatings={myRatings}
                preferMine={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

