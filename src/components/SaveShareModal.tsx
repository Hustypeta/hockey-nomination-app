"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
import { signIn } from "next-auth/react";
import { Download, Share2, Link2, Copy, ChevronLeft } from "lucide-react";
import { sharePngDataUrl } from "@/lib/sharePosterImage";
import {
  captureElementToCanvas,
  canvasToPngDataUrl,
  letterboxCanvas,
  downloadDataUrl,
  type PosterLetterboxTheme,
} from "@/lib/captureSharePoster";
import type { ContestTimeBonusPercent } from "@/lib/contestTimeBonus";
import { SHARE_POSTER_CAPTURE_PIXEL_RATIO } from "@/lib/sharePosterLayout";

interface SaveShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Skrytý DOM prvý k zachycení (NHL25 share plakát). */
  captureRef: React.RefObject<HTMLDivElement | null>;
  /** Před exportem obrázku — např. aktualizace data ve footeru (volá se uvnitř flushSync). */
  onBeforeCapture?: () => void;
  /** Po exportu — typicky vrátí capture DOM zpět do "hidden" režimu. */
  onAfterCapture?: () => void;
  isAuthenticated: boolean;
  /** Název nominace (propíše se na plakát + při uložení na server). */
  nominationTitle: string;
  onNominationTitleChange: (value: string) => void;
  /** Nejlepší dostupný odkaz (krátký /v/slug, /l/code, nebo záložní dlouhý). */
  shareLinkHref: string;
  /** Při uložení k účtu — volitelný název nominace. */
  onSave: (opts?: { title?: string | null }) => Promise<string | null>;
  isSaving: boolean;
  /** Zda server ještě přijímá uložení nominace k soutěži. */
  contestSubmissionOpen?: boolean;
  /** Aktuální časový bonus (pro info u tlačítka uložit). */
  contestTimeBonusPercent?: ContestTimeBonusPercent;
  /** Světlý / tmavý plakát (řídí skrytý DOM před exportem). */
  posterTheme?: PosterLetterboxTheme;
  onPosterThemeChange?: (t: PosterLetterboxTheme) => void;
  /** Dresy vs. jen jména (grafika jako soupiska). */
  posterVariant?: "jerseys" | "names";
  onPosterVariantChange?: (v: "jerseys" | "names") => void;
}

const SHARE_TITLE = "MS 2026 – nominace";
const SHARE_TEXT = "Moje nominace na MS v hokeji 2026 🇨🇿";

export function SaveShareModal({
  isOpen,
  onClose,
  captureRef,
  onBeforeCapture,
  onAfterCapture,
  isAuthenticated,
  nominationTitle,
  onNominationTitleChange,
  shareLinkHref,
  onSave,
  isSaving,
  contestSubmissionOpen = true,
  contestTimeBonusPercent = 0,
  posterTheme = "light",
  onPosterThemeChange,
  posterVariant = "jerseys",
  onPosterVariantChange,
}: SaveShareModalProps) {
  const [shareBusy, setShareBusy] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewFrame, setPreviewFrame] = useState<"original" | "1x1" | "9x16" | "16x9">("original");
  /** Téma pozadí letterboxu — podle okamžiku generování plakátu. */
  const [exportLetterboxTheme, setExportLetterboxTheme] = useState<PosterLetterboxTheme>("light");
  const [framedPreviewUrl, setFramedPreviewUrl] = useState<string | null>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const linkForSocial = shareLinkHref || "";
  const ensureTitle = useCallback((): string | null => {
    const t = nominationTitle.trim();
    if (t) return t;
    const ok = window.confirm("Přejete si pokračovat bez vyplnění jména?");
    if (!ok) return null;
    try {
      const key = "lineup:autoTitle:sestava";
      const raw = window.localStorage.getItem(key);
      const n = Math.max(0, Number.parseInt(raw ?? "0", 10) || 0) + 1;
      window.localStorage.setItem(key, String(n));
      const generated = `Sestava ${n}`;
      onNominationTitleChange(generated);
      return generated;
    } catch {
      const generated = "Sestava";
      onNominationTitleChange(generated);
      return generated;
    }
  }, [nominationTitle, onNominationTitleChange]);

  const resetPreview = useCallback(() => {
    setPreviewDataUrl(null);
    setFramedPreviewUrl(null);
    setPreviewFrame("original");
    baseCanvasRef.current = null;
  }, []);

  useEffect(() => {
    resetPreview();
  }, [posterVariant, resetPreview]);

  useEffect(() => {
    if (!previewDataUrl) {
      setFramedPreviewUrl(null);
      return;
    }
    const base = baseCanvasRef.current;
    if (!base) return;
    if (previewFrame === "original") {
      setFramedPreviewUrl(previewDataUrl);
      return;
    }
    const map = { "1x1": [1080, 1080], "9x16": [1080, 1920], "16x9": [1920, 1080] } as const;
    const [w, h] = map[previewFrame];
    /* Všechny poměry letterbox = celý plakát (žádný ořez hráčů). */
    const out = letterboxCanvas(base, w, h, { theme: exportLetterboxTheme });
    setFramedPreviewUrl(canvasToPngDataUrl(out));
  }, [previewDataUrl, previewFrame, exportLetterboxTheme]);

  const handleGeneratePoster = async () => {
    const title = ensureTitle();
    if (!title) return;
    setShareBusy(true);
    setShareHint(null);
    try {
      flushSync(() => {
        onBeforeCapture?.();
      });
      /* Dvojité rAF: po zobrazení capture DOMu musí WebKit spočítat výšku (scrollHeight) před měřením pro canvas. */
      await new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r()))
      );
      const el = captureRef.current;
      if (!el) {
        setShareHint("Plakát se nepodařilo najít. Zkus stránku obnovit.");
        return;
      }
      const bg =
        posterVariant === "names"
          ? "#060b14"
          : posterTheme === "dark"
            ? "#0b0e14"
            : "#e8ecf2";
      const canvas = await captureElementToCanvas(el, {
        scale: SHARE_POSTER_CAPTURE_PIXEL_RATIO,
        backgroundColor: bg,
      });
      baseCanvasRef.current = canvas;
      setExportLetterboxTheme(
        posterVariant === "names" ? "dark" : posterTheme === "dark" ? "dark" : "light"
      );
      const raw = canvasToPngDataUrl(canvas);
      setPreviewDataUrl(raw);
      setPreviewFrame("original");
    } catch (err) {
      console.error(err);
      setShareHint(
        "Generování obrázku se nepovedlo. Zkus to znovu za chvíli; na mobilu často pomůže obnovit stránku nebo zavřít jiné karty."
      );
    } finally {
      setShareBusy(false);
      onAfterCapture?.();
    }
  };

  const downloadAspect = (w: number, h: number, suffix: string) => {
    const base = baseCanvasRef.current;
    if (!base) return;
    const out = letterboxCanvas(base, w, h, { theme: exportLetterboxTheme });
    downloadDataUrl(canvasToPngDataUrl(out), `ms2026-nominace-${suffix}.png`);
  };

  const webSharePng = async (w: number, h: number, filename: string) => {
    const base = baseCanvasRef.current;
    if (!base) return;
    const out = letterboxCanvas(base, w, h, { theme: exportLetterboxTheme });
    const dataUrl = canvasToPngDataUrl(out);
    const result = await sharePngDataUrl(dataUrl, {
      filename,
      title: SHARE_TITLE,
      text: SHARE_TEXT,
      url: linkForSocial || undefined,
    });
    if (result.ok && result.method === "clipboard") {
      setShareHint(
        "Obrázek je ve schránce — na Instagramu ho vlož (Ctrl+V) nebo ho nahraj ze složky Stažené."
      );
    } else if (!result.ok && result.reason !== "cancelled") {
      setShareHint(
        "Systémové sdílení obrázku tady nejde — použij „Stáhnout PNG“ níže, nebo zkopíruj odkaz. Na iPhonu jde obrázek často jen uložit do Fotek a odtud sdílet."
      );
    }
  };

  const handleShareLink = async () => {
    if (!nominationTitle.trim()) return;
    const url = linkForSocial;
    if (!url) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: SHARE_TITLE,
          text: "Podívej se na moji nominaci.",
          url,
        });
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    const url = linkForSocial;
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNomination = async () => {
    if (!isAuthenticated) return;
    const t = ensureTitle();
    if (!t) return;
    const id = await onSave({ title: t });
    if (id) setSavedId(id);
  };

  const handleClose = () => {
    setSavedId(null);
    setShareHint(null);
    resetPreview();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-md sm:p-6">
      <div className="card-glow max-h-[min(92vh,900px)] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-[#c8102e] bg-gradient-to-b from-[#1a1f2e] via-[#12151f] to-[#0c0e14] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_32px_80px_rgba(0,0,0,0.55)]">
        <div className="p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[#c8102e]/90">
                MS 2026
              </p>
              <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">Sdílet sestavu</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/65">
                Zde si můžete vybrat, jakým způsobem chcete svoji sestavu sdílet. Pokud jste přihlášeni, můžete si také
                uložit koncept sestavy na svůj účet (kliknutím na{" "}
                <strong className="font-semibold text-white/85">Uložit sestavu</strong> dole).
              </p>
            </div>
          </div>

          {shareHint && (
            <p className="mb-4 rounded-xl border border-amber-600/40 bg-amber-950/35 px-4 py-3 text-sm leading-relaxed text-amber-100/95">
              {shareHint}
            </p>
          )}

          <div className="mb-5 rounded-xl border border-white/10 bg-black/20 p-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/45">
                Název nominace <span className="font-normal text-white/35">(volitelné)</span>
              </span>
              <input
                type="text"
                value={nominationTitle}
                onChange={(e) => onNominationTitleChange(e.target.value)}
                maxLength={80}
                placeholder="např. Varianta po čtvrtfinále"
                disabled={!!savedId}
                className="w-full rounded-xl border border-white/12 bg-[#0a0c10] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#c8102e]/45 focus:outline-none focus:ring-1 focus:ring-[#c8102e]/30 disabled:opacity-50"
              />
            </label>
            <p className="mt-2 text-[11px] leading-snug text-white/45">
              Určuje text na plakátu a veřejnou adresu odkazu ve tvaru{" "}
              <span className="text-sky-300/90">…/váš-název</span>.
            </p>
          </div>

          {!previewDataUrl ? (
            <>
              {onPosterVariantChange ? (
                <div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">
                    Typ obrázku
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onPosterVariantChange("jerseys")}
                      className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-colors sm:text-sm ${
                        posterVariant === "jerseys"
                          ? "bg-white text-slate-900 ring-2 ring-[#c8102e]/60"
                          : "bg-white/5 text-white/55 hover:bg-white/10"
                      }`}
                    >
                      S dresy
                    </button>
                    <button
                      type="button"
                      onClick={() => onPosterVariantChange("names")}
                      className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-colors sm:text-sm ${
                        posterVariant === "names"
                          ? "bg-[#003087] text-white ring-2 ring-sky-400/45"
                          : "bg-white/5 text-white/55 hover:bg-white/10"
                      }`}
                    >
                      Jen jména
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-white/45">
                    {posterVariant === "names"
                      ? "Tmavá grafika se jmény — vhodná na feed nebo posílání jako obrázek (podobná soupisce)."
                      : "Plakát s fotkami dresů — přepni Světlý / Tmavý podle pozadí."}
                  </p>
                </div>
              ) : null}

              {onPosterThemeChange && posterVariant === "jerseys" ? (
                <div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">
                    Vzhled plakátu
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onPosterThemeChange("light")}
                      className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-colors sm:text-sm ${
                        posterTheme === "light"
                          ? "bg-white text-slate-900 ring-2 ring-[#c8102e]/60"
                          : "bg-white/5 text-white/55 hover:bg-white/10"
                      }`}
                    >
                      Světlý
                    </button>
                    <button
                      type="button"
                      onClick={() => onPosterThemeChange("dark")}
                      className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-colors sm:text-sm ${
                        posterTheme === "dark"
                          ? "bg-[#0f172a] text-white ring-2 ring-sky-500/50"
                          : "bg-white/5 text-white/55 hover:bg-white/10"
                      }`}
                    >
                      Tmavý (sítě)
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleGeneratePoster}
                  disabled={shareBusy}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#c8102e] via-[#d41432] to-[#9e0c24] py-4 font-display text-lg font-bold tracking-wide text-white shadow-[0_12px_40px_rgba(200,16,46,0.35)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 sm:py-5 sm:text-xl"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Share2 className="h-5 w-5 opacity-95" aria-hidden />
                    {shareBusy ? "Generuji plakát…" : "Sdílet obrázek"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShareLink}
                  className="w-full rounded-xl border-2 border-[#003087]/80 bg-[#003087]/25 py-3.5 font-display text-base font-bold tracking-wide text-white transition-colors hover:bg-[#003087]/40 disabled:cursor-not-allowed disabled:opacity-45 sm:py-4 sm:text-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Link2 className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                    Sdílet odkaz
                  </span>
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/25 p-3 sm:p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Odkaz</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <input
                    type="text"
                    readOnly
                    value={linkForSocial}
                    className="min-w-0 flex-1 truncate rounded-lg border border-white/10 bg-[#0a0c10] px-3 py-2.5 text-xs text-white/90"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#003087] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0040a8] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Copy className="h-4 w-4" aria-hidden />
                    {copied ? "Zkopírováno" : "Kopírovat"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Náhled — poměr stran
                </p>
                <div className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
                  {(
                    [
                      ["original", "Plakát"],
                      ["1x1", "1 : 1"],
                      ["9x16", "9 : 16"],
                      ["16x9", "16 : 9"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPreviewFrame(id)}
                      title={
                        id === "1x1"
                          ? "Celá soupiska v čtverci — žádný ořez hráčů; po stranách letterbox (šedý/tmavý pruh), protože plakát je vyšší než široký."
                          : id === "9x16"
                            ? "Celý plakát ve formátu na mobil — všichni hráči."
                            : id === "16x9"
                              ? "Celý plakát na šířku — všichni hráči."
                              : "Původní poměr exportu."
                      }
                      className={`rounded-lg py-2 text-center text-[10px] font-bold uppercase tracking-wide sm:text-[11px] ${
                        previewFrame === id
                          ? "bg-[#003087] text-white ring-1 ring-sky-400/50"
                          : "bg-white/5 text-white/55 ring-1 ring-white/10 hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-center text-[11px] leading-snug text-white/50">
                  Export je celý plakát bez ořezu hráčů. U poměru <strong className="font-semibold text-white/70">1 : 1</strong>{" "}
                  je plakát užší než čtverec — po stranách jsou automaticky doplněné pruhy (letterbox), aby se vešla celá
                  soupiska. To není chyba rozvržení. Na mobil často lépe sedí <strong className="font-semibold text-white/70">9 : 16</strong>.
                </p>
              </div>

              <div className="overflow-hidden rounded-lg bg-black/20 p-0 shadow-inner ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={framedPreviewUrl ?? previewDataUrl ?? undefined}
                  alt="Náhled plakátu nominace"
                  className="mx-auto max-h-[min(72vh,720px)] w-full max-w-full rounded-md object-contain"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => downloadAspect(1080, 1920, "stories-9x16")}
                  title="Celá soupiska — všichni hráči; na telefonu větší než čtverec."
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 font-display text-sm font-bold tracking-wide text-white ring-1 ring-white/15 transition-colors hover:bg-white/[0.14]"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Stáhnout PNG 9:16
                </button>
                <button
                  type="button"
                  onClick={() => downloadAspect(1080, 1080, "feed-1x1")}
                  title="1080×1080 — celá soupiska bez ořezu; boční letterbox, plakát je užší než čtverec."
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 font-display text-sm font-bold tracking-wide text-white ring-1 ring-white/15 transition-colors hover:bg-white/[0.14]"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Stáhnout PNG 1:1
                </button>
                <button
                  type="button"
                  onClick={() => downloadAspect(1920, 1080, "wide-16x9")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 font-display text-sm font-bold tracking-wide text-white ring-1 ring-white/15 transition-colors hover:bg-white/[0.14] sm:col-span-2"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Stáhnout PNG 16:9
                </button>
              </div>

              <button
                type="button"
                onClick={() => webSharePng(1080, 1920, "ms2026-nominace-stories.png")}
                disabled={shareBusy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003087] to-[#002266] py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-[#003087]/20 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Share2 className="h-4 w-4" aria-hidden />
                Sdílet přes systém (9:16)
              </button>

              <div className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/85 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Copy className="h-4 w-4" aria-hidden />
                  {copied ? "Odkaz zkopírován" : "Kopírovat odkaz"}
                </button>
                <button
                  type="button"
                  onClick={handleShareLink}
                  className="text-sm font-semibold text-sky-300/90 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Sdílet odkaz…
                </button>
              </div>

              <button
                type="button"
                onClick={resetPreview}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 py-3 text-sm text-white/70 transition-colors hover:bg-white/5"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Zpět a nový obrázek
              </button>
            </div>
          )}

          {isAuthenticated && (
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="mb-3 text-center text-[11px] leading-snug text-white/50">
                Uložením vznikne koncept u účtu — do soutěže pošli sestavu tlačítkem{" "}
                <strong className="text-white/75">Odeslat do soutěže</strong> v editoru. Časový bonus (aktuálně{" "}
                <strong className="text-amber-200/90">+{contestTimeBonusPercent} %</strong>) se zapíše až při tom
                odeslání.
              </p>
              {!contestSubmissionOpen ? (
                <p className="mb-3 rounded-lg border border-amber-600/35 bg-amber-950/25 px-3 py-2.5 text-center text-xs leading-relaxed text-amber-100/90">
                  Uzávěrka odeslání do soutěže už proběhla — koncepty u účtu můžeš dál ukládat. Odkaz a plakát pořád
                  můžeš sdílet.
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleSaveNomination}
                disabled={isSaving || !!savedId}
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 font-sans text-base font-semibold leading-snug tracking-normal text-white shadow-inner transition-colors hover:border-[#c8102e]/45 hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-45 sm:py-4 sm:text-lg"
              >
                {savedId ? "Sestava uložena u účtu" : isSaving ? "Ukládám…" : "Uložit sestavu"}
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: window.location.href })}
                className="w-full rounded-xl border border-white/15 py-3 font-display text-sm text-white/90 transition-colors hover:border-[#c8102e]/45"
              >
                Přihlásit se přes Google
              </button>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: window.location.href })}
                className="w-full rounded-xl bg-gradient-to-r from-[#c8102e] to-[#8a0b22] py-3 text-center font-display text-base font-bold text-white shadow-lg shadow-[#c8102e]/15"
              >
                Zúčastnit se soutěže
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="mt-6 w-full rounded-xl border border-white/12 py-2.5 text-sm text-white/65 transition-colors hover:border-white/25 hover:text-white"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
