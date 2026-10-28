import { loadPosterAssetAsDataUrl } from "@/lib/posterAssetCache";

export const POSTER_ROSTER_ICE_BG_PATH = "/images/reprezentace/poster-roster-ice-bg.png";

/** Bump when replacing the PNG in public/images (cache bust for dev + export). */
export const POSTER_ROSTER_ICE_BG_REVISION = "6";

export function posterRosterIceBgUrl(revision: string | number = POSTER_ROSTER_ICE_BG_REVISION): string {
  return `${POSTER_ROSTER_ICE_BG_PATH}?r=${revision}`;
}

/** Načte PNG jako data URL — html-to-image jinak často pozadí vůbec nevykreslí. */
export function loadPosterIceBgAsDataUrl(
  revision: string | number = POSTER_ROSTER_ICE_BG_REVISION
): Promise<string> {
  return loadPosterAssetAsDataUrl(posterRosterIceBgUrl(revision));
}

/** Před html-to-image vloží revizované PNG inline; data se sdílí mezi mountem i exporty. */
export async function ensureFreshPosterIceBackground(root: HTMLElement): Promise<void> {
  const img = root.querySelector<HTMLImageElement>("[data-poster-ice-bg]");
  if (!img) return;

  const currentSrc = img.getAttribute("src") ?? "";
  if (currentSrc.startsWith("data:image/")) {
    await img.decode().catch(() => undefined);
    return;
  }

  const dataUrl = await loadPosterIceBgAsDataUrl();
  if (img.getAttribute("src") !== dataUrl) {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Poster ice bg decode failed"));
      img.src = dataUrl;
    });
  }
  await img.decode().catch(() => undefined);
}
