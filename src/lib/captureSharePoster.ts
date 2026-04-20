import { toCanvas } from "html-to-image";

/**
 * Export plakátu přes html-to-image (SVG → canvas v prohlížeči).
 * html2canvas neumí barvy ve tvaru oklab(), které Tailwind v4 generuje z theme.
 */
export async function captureElementToCanvas(
  element: HTMLElement,
  options?: { scale?: number; backgroundColor?: string | null }
): Promise<HTMLCanvasElement> {
  /** Vyšší než 1:1 s cílovým PNG — ostřejší text po zmenšení (sociální sítě 1080px). */
  const pixelRatio = options?.scale ?? 4;
  await document.fonts.ready.catch(() => undefined);
  return toCanvas(element, {
    pixelRatio,
    backgroundColor: options?.backgroundColor ?? "#e8ecf2",
    cacheBust: true,
  });
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
