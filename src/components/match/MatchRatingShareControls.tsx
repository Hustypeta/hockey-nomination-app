"use client";

import { useState } from "react";
import { toast } from "sonner";

export function MatchRatingShareControls({ matchSlug, defaultTitle }: { matchSlug: string; defaultTitle: string }) {
  const [title, setTitle] = useState(defaultTitle);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  const create = async () => {
    setBusy(true);
    try {
      const r = await fetch("/api/match-rating-share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchSlug, title }),
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">Export hodnocení</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold text-white"
            placeholder="Název exportu (volitelné)"
          />
          {url ? (
            <div className="mt-2 break-all text-xs text-white/70">
              <span className="text-white/50">Odkaz:</span> {url}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void create()}
          className="rounded-xl bg-gradient-to-r from-[#003087] to-[#c8102e] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"
        >
          {busy ? "Vytvářím…" : "Vytvořit odkaz"}
        </button>
      </div>
    </div>
  );
}

