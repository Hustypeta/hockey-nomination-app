const dataUrlPromiseByUrl = new Map<string, Promise<string>>();

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Poster asset read failed"));
    reader.readAsDataURL(blob);
  });
}

function cacheKeyForUrl(url: string): string {
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  try {
    const resolved = new URL(url, typeof window !== "undefined" ? window.location.href : "https://hokejlineup.cz");
    return `${resolved.pathname}${resolved.search}`;
  } catch {
    return url;
  }
}

function isInlineablePosterUrl(url: string): boolean {
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) return false;
  try {
    const resolved = new URL(url, typeof window !== "undefined" ? window.location.href : "https://hokejlineup.cz");
    if (typeof window !== "undefined" && resolved.origin !== window.location.origin) return false;
    return resolved.pathname.startsWith("/images/") || resolved.pathname === "/apple-touch-icon.png";
  } catch {
    return url.startsWith("/images/");
  }
}

/**
 * Sdílený převod statického obrázku na data URL.
 * Stejná revizovaná URL se během životnosti stránky načte a dekóduje pouze jednou.
 */
export function loadPosterAssetAsDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return Promise.resolve(url);

  const key = cacheKeyForUrl(url);
  const cached = dataUrlPromiseByUrl.get(key);
  if (cached) return cached;

  const pending = fetch(url, { cache: "force-cache" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Poster asset fetch failed (${response.status}): ${url}`);
      }
      return response.blob();
    })
    .then(blobToDataUrl)
    .catch((error) => {
      dataUrlPromiseByUrl.delete(key);
      throw error;
    });

  dataUrlPromiseByUrl.set(key, pending);
  return pending;
}

/** Předem natáhne statické PNG (led, dresy, pozadí) do sdílené cache. */
export async function preloadPosterAssets(urls: Array<string | null | undefined>): Promise<void> {
  const unique = [...new Set(urls.filter((url): url is string => Boolean(url && isInlineablePosterUrl(url))))];
  await Promise.all(unique.map((url) => loadPosterAssetAsDataUrl(url).catch(() => "")));
}

/**
 * html-to-image jinak stahuje každý `<img>` znovu. Unikátní same-origin PNG
 * nahradí data URL ze sdílené cache — pixely zůstanou stejné, serializace je rychlejší.
 */
export async function inlinePosterImagesAsDataUrls(root: HTMLElement): Promise<void> {
  const images = [...root.querySelectorAll<HTMLImageElement>("img")];
  const uniqueUrls = [
    ...new Set(
      images
        .map((image) => image.currentSrc || image.getAttribute("src") || "")
        .filter((url) => isInlineablePosterUrl(url))
    ),
  ];
  if (uniqueUrls.length === 0) return;

  const resolved = await Promise.all(
    uniqueUrls.map(async (url) => {
      try {
        return [url, await loadPosterAssetAsDataUrl(url)] as const;
      } catch {
        return [url, url] as const;
      }
    })
  );
  const dataUrlBySrc = new Map(resolved);

  for (const image of images) {
    const src = image.currentSrc || image.getAttribute("src") || "";
    const next = dataUrlBySrc.get(src);
    if (!next || next === src || next === image.getAttribute("src")) continue;
    image.src = next;
  }
}
