"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MsFantasyIgLineupPoster } from "@/components/admin/MsFantasyIgLineupPoster";
import {
  captureElementToCanvas,
  canvasToPngDataUrl,
  downloadDataUrl,
  preparePosterCapture,
} from "@/lib/captureSharePoster";
import { MS_FANTASY_IG_POSTER_H, MS_FANTASY_IG_POSTER_W } from "@/lib/msFantasyPosterLayout";
import type { FantasyLineupPosterPayload } from "@/lib/msFantasyPosterTypes";

export function MsFantasyPosterExportPanel() {
  const [poster, setPoster] = useState<FantasyLineupPosterPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [winnerName, setWinnerName] = useState("");
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/fantasy/poster/best-day", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { poster?: FantasyLineupPosterPayload; error?: string }) => {
        if (cancelled) return;
        if (d.poster) {
          setPoster(d.poster);
          setWinnerName("");
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Plakát se nepodařilo načíst.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const runExport = useCallback(async () => {
    const el = captureRef.current;
    if (!el || !poster) return;
    setExporting(true);
    try {
      await preparePosterCapture();
      const canvas = await captureElementToCanvas(el, {
        scale: 2,
        backgroundColor: "#05060f",
      });
      const out = document.createElement("canvas");
      out.width = MS_FANTASY_IG_POSTER_W;
      out.height = MS_FANTASY_IG_POSTER_H;
      const ctx = out.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.fillStyle = "#05060f";
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(canvas, 0, 0, out.width, out.height);
      const dataUrl = canvasToPngDataUrl(out);
      const slug = poster.gameDaySlug.replace(/[^\d-]/g, "").slice(0, 24) || "fantasy";
      downloadDataUrl(dataUrl, `fantasy-ig-${slug}-${poster.points}b.png`);
      toast.success("Plakát stažen (1080×1080).");
    } catch (e) {
      console.error(e);
      toast.error("Export PNG selhal.");
    } finally {
      setExporting(false);
    }
  }, [poster]);

  if (loading) {
    return <p className="text-sm text-slate-500">Načítám data pro IG plakát…</p>;
  }

  if (!poster) {
    return (
      <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
        Zatím není vyhodnocená sestava k exportu na plakát.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block min-w-[200px] flex-1 text-xs font-semibold text-slate-400">
          Jméno vítěze (doplníš ručně na plakát)
          <input
            value={winnerName}
            onChange={(e) => setWinnerName(e.target.value)}
            placeholder="např. Jan Novák"
            maxLength={40}
            className="mt-1.5 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/40 focus:outline-none"
          />
        </label>
        <button
          type="button"
          disabled={exporting}
          onClick={() => void runExport()}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {exporting ? "Exportuji…" : "Stáhnout IG plakát (1080×1080)"}
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Nejlepší den: <span className="text-slate-300">{poster.gameDayTitle}</span> ·{" "}
        <span className="font-bold text-[#f1c40f]">{poster.points} bodů</span> · kapitál{" "}
        {poster.salarySpent}/{poster.salaryCap} · návrh: {poster.suggestedDisplayName}
      </p>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-3">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <ImageIcon className="h-3.5 w-3.5" aria-hidden />
          Náhled
        </p>
        <div className="mx-auto max-w-[360px] overflow-hidden rounded-xl shadow-2xl">
          <div className="origin-top-left scale-[0.333333]" style={{ width: 1080, height: 1080 }}>
            <MsFantasyIgLineupPoster data={poster} winnerName={winnerName} />
          </div>
        </div>
      </div>

      {/* Off-screen plná velikost pro html-to-image */}
      <div className="pointer-events-none fixed left-[-9999px] top-0 opacity-0" aria-hidden>
        <MsFantasyIgLineupPoster ref={captureRef} data={poster} winnerName={winnerName} />
      </div>
    </div>
  );
}
