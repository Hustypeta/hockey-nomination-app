"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
import { signIn } from "next-auth/react";
import { Download, Share2, Link2, Copy, ChevronLeft } from "lucide-react";
import type { LineupStructure } from "@/types";
import { encodeSharePayload } from "@/lib/sharePayload";
import { sharePngDataUrl } from "@/lib/sharePosterImage";
import {
  captureElementToCanvas,
  canvasToPngDataUrl,
  letterboxCanvas,
  downloadDataUrl,
  type PosterLetterboxTheme,
} from "@/lib/captureSharePoster";
import type { ContestTimeBonusPercent } from "@/lib/contestTimeBonus";

interface SaveShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Skrytý DOM prvý k zachycení (NHL25 share plakát). */
  captureRef: React.RefObject<HTMLDivElement | null>;
  /** Před exportem obrázku — např. aktualizace data ve footeru (volá se uvnitř flushSync). */
  onBeforeCapture?: () => void;
  isAuthenticated: boolean;
  /** Název nominace (propíše se na plakát + při uložení na server). */
  nominationTitle: string;
  onNominationTitleChange: (value: string) => void;
  lineupStructure: LineupStructure;
  captainId: string | null;
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
}

const SHARE_TITLE = "MS 2026 – nominace";
const SHARE_TEXT = "Moje nominace na MS v hokeji 2026 🇨🇿";

export function SaveShareModal({
  isOpen,
  onClose,
  captureRef,
  onBeforeCapture,
  isAuthenticated,
  nominationTitle,
  onNominationTitleChange,
  lineupStructure,
  captainId,
  onSave,
  isSaving,
  contestSubmissionOpen = true,
  contestTimeBonusPercent = 0,
  posterTheme = "light",
  onPosterThemeChange,
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

  const guestShareUrl = useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/share?z=${encodeSharePayload({
            v: 1,
            captainId,
            lineupStructure,
          })}`
        : "",
    [captainId, lineupStructure]
  );

  const linkToShow = useMemo(() => {
    if (typeof window === "undefined") return "";
    if (savedId) return `${window.location.origin}/nominations/${savedId}`;
    return guestShareUrl;
  }, [guestShareUrl, savedId]);

  const linkForSocial = linkToShow || guestShareUrl || "";

  const resetPreview = useCallback(() => {
    setPreviewDataUrl(null);
    setFramedPreviewUrl(null);
    setPreviewFrame("original");
    baseCanvasRef.current = null;
  }, []);

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
    const out = letterboxCanvas(base, w, h, { theme: exportLetterboxTheme });
    setFramedPreviewUrl(canvasToPngDataUrl(out));
  }, [previewDataUrl, previewFrame, exportLetterboxTheme]);

  const handleGeneratePoster = async () => {
    setShareBusy(true);
    setShareHint(null);
    try {
      flushSync(() => {
        onBeforeCapture?.();
      });
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      await new Promise<void>((r) => queueMicrotask(r));
      const el = captureRef.current;
      if (!el) {
        setShareHint("Plakát se nepodařilo najít. Zkus stránku obnovit.");
        return;
      }
      const bg = posterTheme === "dark" ? "#0b0e14" : "#e8ecf2";
      const canvas = await captureElementToCanvas(el, { scale: 3, backgroundColor: bg });
      baseCanvasRef.current = canvas;
      setExportLetterboxTheme(posterTheme === "dark" ? "dark" : "light");
      const raw = canvasToPngDataUrl(canvas);
      setPreviewDataUrl(raw);
      setPreviewFrame("original");
    } catch (err) {
      console.error(err);
      setShareHint("Generování obrázku se nepovedlo. Zkus to znovu.");
    } finally {
      setShareBusy(false);
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
      setShareHint("Systémové sdílení tady nejde — stáhni PNG níže nebo zkopíruj odkaz.");
    }
  };

  const handleShareLink = async () => {
    const url = linkToShow || guestShareUrl;
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
    const url = linkToShow || guestShareUrl;
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNomination = async () => {
    if (!isAuthenticated) return;
    const id = await onSave({ title: nominationTitle.trim() || null });
    if (id) setSavedId(id);
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(`${SHARE_TEXT}\n${linkForSocial}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const openFacebook = () => {
    if (!linkForSocial) return;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkForSocial)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openX = () => {
    const text = encodeURIComponent(SHARE_TEXT);
    const url = encodeURIComponent(linkForSocial);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  };

  const instagramStories = () => {
    downloadAspect(1080, 1920, "stories-9x16");
    setShareHint(
      "PNG pro Stories (9:16) stažen — v Instagramu otevři Stories → galerie a vyber soubor."
    );
  };

  const openTikTokUpload = () => {
    window.open("https://www.tiktok.com/upload?lang=cs", "_blank", "noopener,noreferrer");
    setShareHint(
      "Na TikToku přidej video nebo obrázek — ideálně stáhni plakát v poměru 9:16 výše a nahraj ze zařízení."
    );
  };

  const snapchatFromFilesHint = () => {
    setShareHint(
      "Snapchat nemá webové nahrávání jako TikTok — ulož PNG (9:16), pak v aplikaci vlož ze souborů / fotoaparátu."
    );
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
              <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">Sdílet nominaci</h2>
              <p className="mt-2 max-w-md text-sm text-white/55">
                Prémiový plakát ve stylu sestavy — idealní pro skupiny a sociální sítě.
              </p>
            </div>
          </div>

          {shareHint && (
            <p className="mb-4 rounded-xl border border-amber-600/40 bg-amber-950/35 px-4 py-3 text-sm leading-relaxed text-amber-100/95">
              {shareHint}
            </p>
          )}

          {!previewDataUrl ? (
            <>
              {onPosterThemeChange ? (
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
                  className="w-full rounded-xl border-2 border-[#003087]/80 bg-[#003087]/25 py-3.5 font-display text-base font-bold tracking-wide text-white transition-colors hover:bg-[#003087]/40 sm:py-4 sm:text-lg"
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
                    value={linkToShow || guestShareUrl}
                    className="min-w-0 flex-1 truncate rounded-lg border border-white/10 bg-[#0a0c10] px-3 py-2.5 text-xs text-white/90"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#003087] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0040a8]"
                  >
                    <Copy className="h-4 w-4" aria-hidden />
                    {copied ? "Zkopírováno" : "Kopírovat"}
                  </button>
                </div>
                <p className="mt-2 text-[10px] leading-snug text-white/38">
                  Odkaz je komprimovaný — kratší než dřív, staré odkazy pořád fungují. Pro náhled v sociálních sítích si ulož
                  nominaci k účtu — tam je kratší URL než hostovaný odkaz.
                </p>
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
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/12 bg-black/30 p-2 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={framedPreviewUrl ?? previewDataUrl ?? undefined}
                  alt="Náhled plakátu nominace"
                  className="mx-auto max-h-[min(48vh,480px)] w-auto max-w-full rounded-lg object-contain"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => downloadAspect(1080, 1920, "stories-9x16")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 font-display text-sm font-bold tracking-wide text-white ring-1 ring-white/15 transition-colors hover:bg-white/[0.14]"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Stáhnout PNG 9:16
                </button>
                <button
                  type="button"
                  onClick={() => downloadAspect(1080, 1080, "feed-1x1")}
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003087] to-[#002266] py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-[#003087]/20"
              >
                <Share2 className="h-4 w-4" aria-hidden />
                Sdílet přes systém (9:16)
              </button>

              <div>
                <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Rychlé sdílení
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={openWhatsApp}
                    className="rounded-lg border border-white/12 bg-[#25D366]/15 py-2.5 text-center text-xs font-bold text-[#b8f5c8] transition-colors hover:bg-[#25D366]/25"
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={openFacebook}
                    className="rounded-lg border border-white/12 bg-[#1877f2]/15 py-2.5 text-center text-xs font-bold text-[#a8c7ff] transition-colors hover:bg-[#1877f2]/25"
                  >
                    Facebook
                  </button>
                  <button
                    type="button"
                    onClick={instagramStories}
                    className="rounded-lg border border-white/12 bg-gradient-to-br from-[#f09433]/20 via-[#e6683c]/20 to-[#bc1888]/20 py-2.5 text-center text-xs font-bold text-pink-100/90 transition-colors hover:opacity-95"
                  >
                    IG Stories
                  </button>
                  <button
                    type="button"
                    onClick={openX}
                    className="rounded-lg border border-white/12 bg-white/10 py-2.5 text-center text-xs font-bold text-white/90 transition-colors hover:bg-white/15"
                  >
                    X
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={openTikTokUpload}
                    className="rounded-lg border border-white/12 bg-black/35 py-2.5 text-center text-xs font-bold text-white/90 transition-colors hover:bg-black/45 sm:col-span-2"
                  >
                    TikTok (upload)
                  </button>
                  <button
                    type="button"
                    onClick={snapchatFromFilesHint}
                    className="rounded-lg border border-[#FFFC00]/25 bg-[#FFFC00]/10 py-2.5 text-center text-xs font-bold text-yellow-100/95 transition-colors hover:bg-[#FFFC00]/15 sm:col-span-2"
                  >
                    Snapchat — návod
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/85 hover:bg-white/5"
                >
                  <Copy className="h-4 w-4" aria-hidden />
                  {copied ? "Odkaz zkopírován" : "Kopírovat odkaz"}
                </button>
                <button
                  type="button"
                  onClick={handleShareLink}
                  className="text-sm font-semibold text-sky-300/90 underline-offset-2 hover:underline"
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
              <label className="mb-3 block">
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
                className="w-full rounded-xl border border-white/12 bg-white/[0.04] py-3 font-display text-sm font-semibold text-white transition-colors hover:border-[#c8102e]/40 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {savedId ? "Nominace uložena u účtu" : isSaving ? "Ukládám…" : "Dokončit nominaci k účtu"}
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
