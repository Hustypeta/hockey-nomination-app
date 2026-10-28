"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
import { signIn } from "next-auth/react";
import { Download, Share2, ChevronLeft, X } from "lucide-react";
import { sharePngDataUrl } from "@/lib/sharePosterImage";
import {
  captureElementToCanvas,
  canvasToPngDataUrl,
  letterboxCanvas,
  downloadDataUrl,
  type PosterLetterboxTheme,
} from "@/lib/captureSharePoster";
import type { ContestTimeBonusPercent } from "@/lib/contestTimeBonus";
import { TipsportPartnerBanner } from "@/components/marketing/TipsportPartnerBanner";
import { FIFA_BTN_PRIMARY, FIFA_BTN_SECONDARY, FIFA_INPUT, FIFA_KICKER } from "@/lib/fifa/fifaUiClasses";
import {
  NOMINATION_WEB_POSTER_H,
  NOMINATION_WEB_POSTER_W,
  SHARE_POSTER_3X4_H,
  SHARE_POSTER_3X4_W,
  SHARE_POSTER_CAPTURE_PIXEL_RATIO,
} from "@/lib/sharePosterLayout";

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
  /** Hostující uložení — nejdřív persistovat sestavu, pak Google OAuth. */
  onGoogleSignIn?: () => void;
  /** Zda server ještě přijímá uložení nominace k soutěži. */
  contestSubmissionOpen?: boolean;
  /** Aktuální časový bonus (pro info u tlačítka uložit). */
  contestTimeBonusPercent?: ContestTimeBonusPercent;
  /** Světlý / tmavý plakát (řídí skrytý DOM před exportem). */
  posterTheme?: PosterLetterboxTheme;
  onPosterThemeChange?: (t: PosterLetterboxTheme) => void;
  /** Dresy vs. jen jména vs. webová grafika nominace (článkový styl). */
  posterVariant?: "jerseys" | "names" | "names-web";
  onPosterVariantChange?: (v: "jerseys" | "names" | "names-web") => void;
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
  onGoogleSignIn,
  contestSubmissionOpen = true,
  contestTimeBonusPercent = 0,
  posterTheme = "light",
  onPosterThemeChange,
  posterVariant = "names",
  onPosterVariantChange,
}: SaveShareModalProps) {
  const [shareBusy, setShareBusy] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewFrame, setPreviewFrame] = useState<"original" | "1x1" | "9x16" | "16x9">("original");
  /** Téma pozadí letterboxu — podle okamžiku generování plakátu. */
  const [exportLetterboxTheme, setExportLetterboxTheme] = useState<PosterLetterboxTheme>("light");
  const [framedPreviewUrl, setFramedPreviewUrl] = useState<string | null>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Odkaz zde nezobrazujeme — ponecháváme jen generování a stažení grafiky.
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
          : posterVariant === "names-web"
            ? "#003087"
            : posterTheme === "dark"
              ? "#0b0e14"
              : "#e8ecf2";
      const canvas = await captureElementToCanvas(el, {
        scale: SHARE_POSTER_CAPTURE_PIXEL_RATIO,
        backgroundColor: bg,
      });
      baseCanvasRef.current = canvas;
      setExportLetterboxTheme(
        posterVariant === "names"
          ? "dark"
          : posterVariant === "names-web"
            ? "light"
            : posterTheme === "dark"
              ? "dark"
              : "light"
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

  // Odkaz v tomto modalu nezobrazujeme (ponecháváme jen grafiku).
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
      url: undefined,
    });
    if (result.ok && result.method === "clipboard") {
      setShareHint(
        "Obrázek je ve schránce — na Instagramu ho vlož (Ctrl+V) nebo ho nahraj ze složky Stažené."
      );
    } else if (!result.ok && result.reason !== "cancelled") {
      setShareHint(
        "Systémové sdílení obrázku tady nejde — použij „Stáhnout PNG“ níže. Na iPhonu jde obrázek často jen uložit do Fotek a odtud sdílet."
      );
    }
  };

  const handleSaveNomination = async () => {
    if (!isAuthenticated) {
      onGoogleSignIn?.();
      return;
    }
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
    <div className="fifa-share-modal-backdrop z-[300]">
      <div className="fifa-share-modal fifa-share-modal--wide max-h-[min(92vh,900px)]">
        <div className="fifa-share-modal__head">
          <div>
            <p className={`mb-1 ${FIFA_KICKER}`}>MS 2026</p>
            <h2 className="font-display text-2xl tracking-wide text-[var(--fifa-text)] sm:text-3xl">Sdílet sestavu</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--fifa-text-secondary)]">
              Zde si můžete vybrat, jakým způsobem chcete svoji sestavu sdílet. Pokud jste přihlášeni, můžete si také
              uložit koncept sestavy na svůj účet (kliknutím na{" "}
              <strong className="font-semibold text-[var(--fifa-text)]">Uložit sestavu</strong> dole).
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="fifa-forum-modal__close"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="fifa-share-modal__body">
          {shareHint && (
            <p className="rounded-[var(--fifa-radius-md)] border border-[var(--fifa-premium)]/40 bg-[var(--fifa-premium-muted)] px-4 py-3 text-sm leading-relaxed text-[var(--fifa-premium)]">
              {shareHint}
            </p>
          )}

          <div className="fifa-share-field">
            <label className="block">
              <span className={`mb-1.5 block ${FIFA_KICKER}`}>
                Název nominace <span className="font-normal normal-case tracking-normal">(volitelné)</span>
              </span>
              <input
                type="text"
                value={nominationTitle}
                onChange={(e) => onNominationTitleChange(e.target.value)}
                maxLength={80}
                placeholder="např. Varianta po čtvrtfinále"
                disabled={!!savedId}
                className={`${FIFA_INPUT} disabled:opacity-50`}
              />
            </label>
            <p className="mt-2 text-[11px] leading-snug text-[var(--fifa-text-muted)]">Určuje text na plakátu.</p>
          </div>

          {!previewDataUrl ? (
            <>
              {onPosterVariantChange ? (
                <div className="fifa-share-field">
                  <p className={`mb-2 ${FIFA_KICKER}`}>Typ obrázku</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => onPosterVariantChange("jerseys")}
                      className={`fifa-share-seg ${posterVariant === "jerseys" ? "fifa-share-seg--active" : ""}`}
                    >
                      S dresy
                    </button>
                    <button
                      type="button"
                      onClick={() => onPosterVariantChange("names")}
                      className={`fifa-share-seg ${posterVariant === "names" ? "fifa-share-seg--active" : ""}`}
                    >
                      Jen jména
                    </button>
                    <button
                      type="button"
                      onClick={() => onPosterVariantChange("names-web")}
                      className={`fifa-share-seg ${posterVariant === "names-web" ? "fifa-share-seg--active" : ""}`}
                    >
                      Web nominace
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-[var(--fifa-text-muted)]">
                    {posterVariant === "names"
                      ? "Tmavá grafika se jmény — nativně 3 : 4 (1080×1440), vhodná na Instagram feed."
                      : posterVariant === "names-web"
                        ? `Grafika nativně vyplňuje formát 3 : 4 (${NOMINATION_WEB_POSTER_W}×${NOMINATION_WEB_POSTER_H} px, Instagram feed). Jiné poměry přidají pruhy kolem celé soupisky.`
                        : "Plakát s dresy nativně 3 : 4 (1080×1440) — přepni Světlý / Tmavý podle pozadí."}
                  </p>
                </div>
              ) : null}

              {onPosterThemeChange && posterVariant === "jerseys" ? (
                <div className="fifa-share-field">
                  <p className={`mb-2 ${FIFA_KICKER}`}>Vzhled plakátu</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onPosterThemeChange("light")}
                      className={`fifa-share-seg flex-1 ${posterTheme === "light" ? "fifa-share-seg--active" : ""}`}
                    >
                      Světlý
                    </button>
                    <button
                      type="button"
                      onClick={() => onPosterThemeChange("dark")}
                      className={`fifa-share-seg flex-1 ${posterTheme === "dark" ? "fifa-share-seg--active" : ""}`}
                    >
                      Tmavý (sítě)
                    </button>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleGeneratePoster}
                disabled={shareBusy}
                className={`${FIFA_BTN_PRIMARY} w-full py-4 text-lg disabled:cursor-not-allowed disabled:opacity-55 sm:py-5 sm:text-xl`}
              >
                <Share2 className="h-5 w-5 opacity-95" aria-hidden />
                {shareBusy ? "Generuji plakát…" : "Sdílet obrázek"}
              </button>
            </>
          ) : (
            <div className="space-y-5">
              <div>
                <p className={`mb-2 text-center ${FIFA_KICKER}`}>Náhled — poměr stran</p>
                <div className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
                  {(
                    posterVariant === "names-web" || posterVariant === "jerseys" || posterVariant === "names"
                      ? [
                          ["original", "3 : 4 IG"],
                          ["1x1", "1 : 1"],
                          ["9x16", "9 : 16"],
                          ["16x9", "16 : 9"],
                        ] as const
                      : ([
                          ["original", "Plakát"],
                          ["1x1", "1 : 1"],
                          ["9x16", "9 : 16"],
                          ["16x9", "16 : 9"],
                        ] as const)
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPreviewFrame(id)}
                      title={
                        id === "original"
                          ? posterVariant === "names-web" ||
                              posterVariant === "jerseys" ||
                              posterVariant === "names"
                            ? "Nativní výstup 1080×1440 (3 : 4). Celá soupiska, žádný ořez hráčů."
                            : "Původní poměr exportu."
                          : id === "1x1"
                          ? "Celá soupiska v čtverci — žádný ořez hráčů; po stranách letterbox (šedý/tmavý pruh), protože plakát je vyšší než široký."
                          : id === "9x16"
                            ? "Celý plakát ve formátu na mobil — všichni hráči."
                            : id === "16x9"
                              ? "Celý plakát na šířku — všichni hráči."
                              : "Původní poměr exportu."
                      }
                      className={`fifa-share-seg py-2 text-center uppercase tracking-wide ${
                        previewFrame === id ? "fifa-share-seg--active" : ""
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-center text-[11px] leading-snug text-[var(--fifa-text-muted)]">
                  {posterVariant === "names-web" ||
                  posterVariant === "jerseys" ||
                  posterVariant === "names" ? (
                    <>
                      Plakát je nativně{" "}
                      <strong className="font-semibold text-[var(--fifa-text-secondary)]">3 : 4</strong> (1080×1440) — výstup zaplňuje celý
                      formát bez vnitřního obdélníku. U <strong className="font-semibold text-[var(--fifa-text-secondary)]">1 : 1</strong> či{" "}
                      <strong className="font-semibold text-[var(--fifa-text-secondary)]">9 : 16</strong> systém doplní pruhy, aby byl celý výpis
                      pořád vidět.
                    </>
                  ) : (
                    <>
                      Export je celý plakát bez ořezu hráčů. U poměru{" "}
                      <strong className="font-semibold text-[var(--fifa-text-secondary)]">1 : 1</strong> je plakát užší než čtverec — po
                      stranách jsou automaticky doplněné pruhy (letterbox), aby se vešla celá soupiska. Na mobil často lépe
                      sedí <strong className="font-semibold text-[var(--fifa-text-secondary)]">9 : 16</strong>.
                    </>
                  )}
                </p>
              </div>

              <div className="overflow-hidden rounded-[var(--fifa-radius-md)] bg-[var(--fifa-bg-base)] p-0 shadow-inner ring-1 ring-[var(--fifa-border)]">
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
                  onClick={() =>
                    downloadAspect(
                      posterVariant === "names-web" ? NOMINATION_WEB_POSTER_W : SHARE_POSTER_3X4_W,
                      posterVariant === "names-web" ? NOMINATION_WEB_POSTER_H : SHARE_POSTER_3X4_H,
                      "instagram-3x4"
                    )
                  }
                  title="Instagram feed — výplň 1080 × 1440."
                  className={`${FIFA_BTN_PRIMARY} sm:col-span-2`}
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Stáhnout PNG 3 : 4 (Instagram)
                </button>
                <button
                  type="button"
                  onClick={() => downloadAspect(1080, 1920, "stories-9x16")}
                  title="Celá soupiska — všichni hráči; na telefonu větší než čtverec."
                  className={FIFA_BTN_SECONDARY}
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Stáhnout PNG 9:16
                </button>
                <button
                  type="button"
                  onClick={() => downloadAspect(1080, 1080, "feed-1x1")}
                  title="1080×1080 — celá soupiska bez ořezu; boční letterbox, plakát je užší než čtverec."
                  className={FIFA_BTN_SECONDARY}
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Stáhnout PNG 1:1
                </button>
                <button
                  type="button"
                  onClick={() => downloadAspect(1920, 1080, "wide-16x9")}
                  className={`${FIFA_BTN_SECONDARY} sm:col-span-2`}
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Stáhnout PNG 16:9
                </button>
              </div>

              {posterVariant === "names-web" ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      webSharePng(NOMINATION_WEB_POSTER_W, NOMINATION_WEB_POSTER_H, "ms2026-nominace-instagram-3x4.png")
                    }
                    disabled={shareBusy}
                    title="Instagram feed — 1080 × 1440."
                    className={`${FIFA_BTN_PRIMARY} w-full disabled:cursor-not-allowed disabled:opacity-45`}
                  >
                    <Share2 className="h-4 w-4" aria-hidden />
                    Sdílet přes systém (3:4)
                  </button>
                  <button
                    type="button"
                    onClick={() => webSharePng(1080, 1920, "ms2026-nominace-stories.png")}
                    disabled={shareBusy}
                    title="Stories / Reels — 1080 × 1920."
                    className={`${FIFA_BTN_SECONDARY} w-full disabled:cursor-not-allowed disabled:opacity-45`}
                  >
                    <Share2 className="h-4 w-4" aria-hidden />
                    Sdílet přes systém (9:16)
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => webSharePng(1080, 1920, "ms2026-nominace-stories.png")}
                  disabled={shareBusy}
                  className={`${FIFA_BTN_PRIMARY} w-full disabled:cursor-not-allowed disabled:opacity-45`}
                >
                  <Share2 className="h-4 w-4" aria-hidden />
                  Sdílet přes systém (9:16)
                </button>
              )}

              <button
                type="button"
                onClick={resetPreview}
                className={`${FIFA_BTN_SECONDARY} w-full`}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Zpět a nový obrázek
              </button>
            </div>
          )}

          {isAuthenticated && (
            <div className="border-t border-[var(--fifa-border)] pt-5">
              <p className="mb-3 text-center text-[11px] leading-snug text-[var(--fifa-text-muted)]">
                Uložením vznikne koncept u účtu — do soutěže pošli sestavu tlačítkem{" "}
                <strong className="text-[var(--fifa-text-secondary)]">Odeslat do soutěže</strong> v editoru. Časový bonus (aktuálně{" "}
                <strong className="text-[var(--fifa-premium)]">+{contestTimeBonusPercent} %</strong>) se zapíše až při tom
                odeslání.
              </p>
              {!contestSubmissionOpen ? (
                <p className="mb-3 rounded-[var(--fifa-radius-md)] border border-[var(--fifa-premium)]/35 bg-[var(--fifa-premium-muted)] px-3 py-2.5 text-center text-xs leading-relaxed text-[var(--fifa-premium)]">
                  Uzávěrka odeslání do soutěže už proběhla — koncepty u účtu můžeš dál ukládat. Plakát pořád můžeš
                  generovat a stáhnout.
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleSaveNomination}
                disabled={isSaving || !!savedId}
                className={`${FIFA_BTN_SECONDARY} w-full py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-45 sm:py-4 sm:text-lg`}
              >
                {savedId ? "Sestava uložena u účtu" : isSaving ? "Ukládám…" : "Uložit sestavu"}
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="flex flex-col gap-3 border-t border-[var(--fifa-border)] pt-5">
              <button
                type="button"
                onClick={() => {
                  onGoogleSignIn?.();
                  if (!onGoogleSignIn) void signIn("google", { callbackUrl: window.location.href });
                }}
                className={`${FIFA_BTN_SECONDARY} w-full`}
              >
                Přihlásit se přes Google
              </button>
              <button
                type="button"
                onClick={() => {
                  onGoogleSignIn?.();
                  if (!onGoogleSignIn) void signIn("google", { callbackUrl: window.location.href });
                }}
                className={`${FIFA_BTN_PRIMARY} w-full py-3`}
              >
                Zúčastnit se soutěže
              </button>
            </div>
          )}

          <TipsportPartnerBanner compact className="fifa-design-tipsport-compact border-t border-[var(--fifa-border)] pt-5" />
        </div>
      </div>
    </div>
  );
}
