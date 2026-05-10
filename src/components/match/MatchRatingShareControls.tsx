"use client";

import { useState } from "react";
import { toast } from "sonner";

export function MatchRatingShareControls({ matchSlug, defaultTitle }: { matchSlug: string; defaultTitle: string }) {
  const [title, setTitle] = useState(defaultTitle);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [snapshotMode, setSnapshotMode] = useState<"personal" | "community">("personal");

  const create = async () => {
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
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">Export hodnocení</div>
          <fieldset className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
            <legend className="sr-only">Co odkaz vyexportuje</legend>
            <label className="flex cursor-pointer gap-2 text-white/82">
              <input
                type="radio"
                name="rating-export-mode"
                checked={snapshotMode === "personal"}
                onChange={() => setSnapshotMode("personal")}
                className="mt-1"
              />
              <span>
                <span className="font-bold text-emerald-200">Moje uložené známky</span>
                <span className="mt-1 block text-xs font-normal leading-snug text-white/55">
                  Přesně to, co máš pod účtem potvrzené u zápasu (ne živý průměr ostatních).
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer gap-2 text-white/82">
              <input
                type="radio"
                name="rating-export-mode"
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
            className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold text-white"
            placeholder="Název exportu (volitelné)"
          />
          {url ? (
            <div className="break-all text-xs text-white/70">
              <span className="text-white/50">Odkaz:</span> {url}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void create()}
          className="shrink-0 rounded-xl bg-gradient-to-r from-[#003087] to-[#c8102e] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"
        >
          {busy ? "Vytvářím…" : "Vytvořit odkaz"}
        </button>
      </div>
    </div>
  );
}
