import { getFontEmbedCSS, toCanvas } from "html-to-image";
import {
  SHARE_POSTER_CAPTURE_PIXEL_RATIO,
  SHARE_POSTER_MAX_CANVAS_EDGE_PX,
} from "@/lib/sharePosterLayout";

/** Balíček `html-to-image` exportuje `Options` jen interně — typ bereme z `toCanvas`. */
export type HtmlToImageOptions = NonNullable<Parameters<typeof toCanvas>[1]>;

/**
 * Sjednocené volby pro html-to-image (`toCanvas` / `toPng`):
 * – `preferredFontFormat: woff2` + vložený CSS z `@font-face` (Barlow Condensed na dresu),
 *   aby se při serializaci do SVG/canvas nepoužilo rozmazané systémové písmo.
 * – `skipFonts: false` vynutí embed Google Fonts z odkazů v dokumentu.
 */
/** Bezpečný pixelRatio — canvas ≈ (w×pr) × (h×pr) musí vejít do limitů WebKit (mobil). */
function isCoarsePointerOrNarrow(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 1023px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

export function safePosterCapturePixelRatio(
  element: HTMLElement,
  desired: number = SHARE_POSTER_CAPTURE_PIXEL_RATIO
): number {
  const w = Math.max(1, Math.ceil(element.offsetWidth));
  const h = Math.max(1, Math.ceil(element.scrollHeight || element.offsetHeight));
  const maxE = SHARE_POSTER_MAX_CANVAS_EDGE_PX;
  const byEdge = Math.min(maxE / w, maxE / h);
  const maxArea = isCoarsePointerOrNarrow() ? maxE * 3072 : maxE * maxE;
  const byArea = Math.sqrt(maxArea / (w * h));
  const mobileCap = isCoarsePointerOrNarrow() ? Math.min(desired, 2) : desired;
  const raw = Math.min(mobileCap, byEdge, byArea);
  const rounded = Math.floor(raw * 1000) / 1000;
  return Math.max(0.75, Math.min(mobileCap, rounded));
}

/** Po zobrazení off-screen plakátu nechat WebKit spočítat layout před html-to-image. */
export async function preparePosterCapture(): Promise<void> {
  await document.fonts.ready.catch(() => undefined);
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

export async function buildHtmlToImageOptions(
  element: HTMLElement,
  partial: HtmlToImageOptions
): Promise<HtmlToImageOptions> {
  await document.fonts.ready.catch(() => undefined);
  const base: HtmlToImageOptions = {
    cacheBust: false,
    skipFonts: false,
    preferredFontFormat: "woff2",
    ...partial,
  };
  try {
    const fontEmbedCSS = await getFontEmbedCSS(element, base);
    return { ...base, fontEmbedCSS };
  } catch {
    return base;
  }
}

/**
 * Export plakátu přes html-to-image (SVG → canvas v prohlížeči).
 * html2canvas neumí barvy ve tvaru oklab(), které Tailwind v4 generuje z theme.
 */
export async function captureElementToCanvas(
  element: HTMLElement,
  options?: { scale?: number; backgroundColor?: string | null }
): Promise<HTMLCanvasElement> {
  await preparePosterCapture();
  const desired = options?.scale ?? SHARE_POSTER_CAPTURE_PIXEL_RATIO;
  const rawBg = options?.backgroundColor;
  const backgroundColor =
    rawBg === undefined ? "#e8ecf2" : rawBg === null ? "rgba(0,0,0,0)" : rawBg;
  const captureW = Math.max(1, Math.ceil(element.scrollWidth || element.offsetWidth));
  const captureH = Math.max(1, Math.ceil(element.scrollHeight || element.offsetHeight));
  const scales = [desired, 2, 1.25].filter((v, i, a) => a.indexOf(v) === i);
  let lastErr: unknown;
  for (const scale of scales) {
    const pixelRatio = safePosterCapturePixelRatio(element, scale);
    try {
      const opts = await buildHtmlToImageOptions(element, {
        pixelRatio,
        backgroundColor,
        width: captureW,
        height: captureH,
        canvasWidth: Math.ceil(captureW * pixelRatio),
        canvasHeight: Math.ceil(captureH * pixelRatio),
      });
      return await toCanvas(element, opts);
    } catch (err) {
      lastErr = err;
      if (scale === scales[scales.length - 1]) break;
    }
  }
  throw lastErr;
}

export type PosterLetterboxTheme = "light" | "dark";

/** Zachová celý plakát uvnitř cílového poměru (letterbox, prémiové pozadí). */
export function letterboxCanvas(
  source: HTMLCanvasElement,
  targetW: number,
  targetH: number,
  opts?: { theme?: PosterLetterboxTheme }
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext("2d");
  if (!ctx) return source;
  const dark = opts?.theme === "dark";
  const g = ctx.createLinearGradient(0, 0, targetW, targetH);
  if (dark) {
    g.addColorStop(0, "#0f172a");
    g.addColorStop(0.5, "#0c1220");
    g.addColorStop(1, "#05080f");
  } else {
    g.addColorStop(0, "#f8fafc");
    g.addColorStop(0.45, "#eef2f7");
    g.addColorStop(1, "#e2e8f0");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, targetW, targetH);
  const sw = source.width;
  const sh = source.height;
  const scale = Math.min(targetW / sw, targetH / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = (targetW - dw) / 2;
  const dy = (targetH - dh) / 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, dx, dy, dw, dh);
  return out;
}

/**
 * Vyplní celý cílový poměr (cover) a ořízne přebytek.
 * Používáme jen tam, kde chceš aby dresy zaplnily formát (např. 1:1).
 */
export function coverCanvas(
  source: HTMLCanvasElement,
  targetW: number,
  targetH: number,
  opts?: { theme?: PosterLetterboxTheme }
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext("2d");
  if (!ctx) return source;

  const dark = opts?.theme === "dark";
  ctx.fillStyle = dark ? "#05080f" : "#e2e8f0";
  ctx.fillRect(0, 0, targetW, targetH);

  const sw = source.width;
  const sh = source.height;
  const scale = Math.max(targetW / sw, targetH / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = (targetW - dw) / 2;
  const dy = (targetH - dh) / 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, dx, dy, dw, dh);
  return out;
}

/**
 * Vyplní šířku cílového formátu bez ořezu nahoře/dole:
 * - zachová celou výšku plakátu
 * - přebytek řeže jen ze stran (left/right)
 *
 * Pozn.: Pokud je zdroj užší než cílový formát při zachování výšky, vrátí výsledek
 * s pruhy po stranách (neřežeme nahoře/dole).
 */
export function sideCropCanvas(
  source: HTMLCanvasElement,
  targetW: number,
  targetH: number,
  opts?: { theme?: PosterLetterboxTheme }
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext("2d");
  if (!ctx) return source;

  const dark = opts?.theme === "dark";
  ctx.fillStyle = dark ? "#05080f" : "#e2e8f0";
  ctx.fillRect(0, 0, targetW, targetH);

  const sw = source.width;
  const sh = source.height;
  const scale = targetH / sh; // vždy zachovej plnou výšku
  const dw = sw * scale;
  const dh = sh * scale; // ~= targetH
  const dx = (targetW - dw) / 2; // když dw > targetW, je dx záporné → ořez jen ze stran
  const dy = 0; // nikdy neřež shora/dole

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, dx, dy, dw, dh);
  return out;
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const MAX_EXPORT_BYTES = 2 * 1024 * 1024; // 2 MB

function scaleCanvas(source: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  if (scale >= 0.999) return source;
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(source.width * scale));
  out.height = Math.max(1, Math.round(source.height * scale));
  const ctx = out.getContext("2d");
  if (!ctx) return source;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, out.width, out.height);
  return out;
}

function blobFromCanvas(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, 1);
  });
}

/** Stažení PNG přes Blob — na iOS spolehlivější než obří data: URL z `toDataURL`. */
export async function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  // Guarantee: exported PNGs should be share-friendly (<= 2 MB).
  // If the PNG is too large, progressively downscale before saving.
  const scales = [1, 0.92, 0.86, 0.8, 0.74, 0.68];
  let lastCanvas = canvas;
  let blob: Blob | null = null;
  for (const s of scales) {
    const c = scaleCanvas(canvas, s);
    lastCanvas = c;
    // eslint-disable-next-line no-await-in-loop
    const b = await blobFromCanvas(c, "image/png");
    if (!b) {
      blob = null;
      break;
    }
    blob = b;
    if (b.size <= MAX_EXPORT_BYTES) break;
  }

  if (!blob) {
    downloadDataUrl(canvasToPngDataUrl(lastCanvas), filename);
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function canvasToPngDataUrl(canvas: HTMLCanvasElement, quality = 1): string {
  return canvas.toDataURL("image/png", quality);
}
