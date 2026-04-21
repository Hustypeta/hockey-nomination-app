import { getFontEmbedCSS, toCanvas } from "html-to-image";

/** Balíček `html-to-image` exportuje `Options` jen interně — typ bereme z `toCanvas`. */
export type HtmlToImageOptions = NonNullable<Parameters<typeof toCanvas>[1]>;

/**
 * Sjednocené volby pro html-to-image (`toCanvas` / `toPng`):
 * – `preferredFontFormat: woff2` + vložený CSS z `@font-face` (Barlow Condensed na dresu),
 *   aby se při serializaci do SVG/canvas nepoužilo rozmazané systémové písmo.
 * – `skipFonts: false` vynutí embed Google Fonts z odkazů v dokumentu.
 */
export async function buildHtmlToImageOptions(
  element: HTMLElement,
  partial: HtmlToImageOptions
): Promise<HtmlToImageOptions> {
  await document.fonts.ready.catch(() => undefined);
  const base: HtmlToImageOptions = {
    cacheBust: true,
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
  /** Vyšší poměr = ostřejší potisk po případném zmenšení na 1080px (Instagram). */
  const pixelRatio = options?.scale ?? 8;
  const opts = await buildHtmlToImageOptions(element, {
    pixelRatio,
    backgroundColor: options?.backgroundColor ?? "#e8ecf2",
  });
  return toCanvas(element, opts);
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

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function canvasToPngDataUrl(canvas: HTMLCanvasElement, quality = 1): string {
  return canvas.toDataURL("image/png", quality);
}
