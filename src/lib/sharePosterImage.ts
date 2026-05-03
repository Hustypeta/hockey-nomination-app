/**
 * Sdílení plakátu na sociální sítě: ideálně obrázek (Instagram, Stories…),
 * odkaz s náhledem funguje hlavně po uložení nominace (/nominations/id + OG image).
 */

export type SharePngResult =
  | { ok: true; method: "native" | "clipboard" }
  | { ok: false; reason: "unsupported" | "cancelled" | "clipboard-failed" };

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((r) => r.blob());
}

/**
 * Safari / WebKit na iOS často odmítne `share({ files, url, text, title })` — funguje jen `{ files }`.
 * iPadOS v „desktop“ režimu hlásí Macintosh + touch.
 */
export function prefersFilesOnlyNativeShare(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iP(hone|ad|od)/i.test(ua)) return true;
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
  return false;
}

/** Zda prohlížeč umí sdílet soubory (typicky mobil Safari / Chrome). */
export function canSharePngFile(): boolean {
  if (typeof navigator === "undefined" || typeof File === "undefined") return false;
  try {
    const f = new File([new Blob([], { type: "image/png" })], "x.png", {
      type: "image/png",
    });
    return Boolean(navigator.canShare?.({ files: [f] }));
  } catch {
    return false;
  }
}

/**
 * PNG z html-to-image (data URL) → systémové sdílení nebo obrázek do schránky.
 */
export async function sharePngDataUrl(
  dataUrl: string,
  meta: {
    filename: string;
    title?: string;
    /** Krátký text u příspěvku (kam platforma podporuje). */
    text?: string;
    /** Odkaz u příspěvku (někde se přidá vedle obrázku). */
    url?: string;
  }
): Promise<SharePngResult> {
  let blob: Blob;
  try {
    blob = await dataUrlToBlob(dataUrl);
  } catch {
    return { ok: false, reason: "unsupported" };
  }

  const file = new File([blob], meta.filename, { type: "image/png" });

  if (navigator.share) {
    const title = meta.title ?? "MS 2026 – nominace";
    const text = meta.text ?? "";
    const payloads: ShareData[] = (() => {
      if (prefersFilesOnlyNativeShare()) return [{ files: [file] }];
      const out: ShareData[] = [];
      if (meta.url) out.push({ files: [file], title, text, url: meta.url });
      out.push({ files: [file], title, text });
      out.push({ files: [file] });
      return out;
    })();

    for (const data of payloads) {
      if (typeof navigator.canShare === "function" && !navigator.canShare(data)) continue;
      try {
        await navigator.share(data);
        return { ok: true, method: "native" };
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          return { ok: false, reason: "cancelled" };
        }
        /* další varianta payloadu nebo schránka */
      }
    }
  }

  if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      return { ok: true, method: "clipboard" };
    } catch {
      return { ok: false, reason: "clipboard-failed" };
    }
  }

  return { ok: false, reason: "unsupported" };
}
