import html2canvas from "html2canvas";

export async function captureElementToCanvas(
  element: HTMLElement,
  options?: { scale?: number; backgroundColor?: string | null }
): Promise<HTMLCanvasElement> {
  const scale = options?.scale ?? 3;
  await document.fonts.ready.catch(() => undefined);
  return html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: options?.backgroundColor ?? "#e8ecf2",
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
  });
}

/** Zachová celý plakát uvnitř cílového poměru (letterbox, prémiové pozadí). */
export function letterboxCanvas(
  source: HTMLCanvasElement,
  targetW: number,
  targetH: number
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext("2d");
  if (!ctx) return source;
  const g = ctx.createLinearGradient(0, 0, targetW, targetH);
  g.addColorStop(0, "#f8fafc");
  g.addColorStop(0.45, "#eef2f7");
  g.addColorStop(1, "#e2e8f0");
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
