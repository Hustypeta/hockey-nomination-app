export const POSTER_ROSTER_ICE_BG_PATH = "/images/poster-roster-ice-bg.png";

/** Bump when replacing the PNG in public/images (cache bust for dev + export). */
export const POSTER_ROSTER_ICE_BG_REVISION = "6";

export function posterRosterIceBgUrl(revision: string | number = POSTER_ROSTER_ICE_BG_REVISION): string {
  return `${POSTER_ROSTER_ICE_BG_PATH}?r=${revision}`;
}

/** Načte PNG jako data URL — html-to-image jinak často pozadí vůbec nevykreslí. */
export async function loadPosterIceBgAsDataUrl(revision?: string | number): Promise<string> {
  const url = posterRosterIceBgUrl(revision ?? Date.now());
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Poster ice bg fetch failed (${res.status})`);
  }
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Poster ice bg read failed"));
    reader.readAsDataURL(blob);
  });
}

/** Před html-to-image vždy vloží aktuální PNG inline (obejde cache i CORS problémy). */
export async function ensureFreshPosterIceBackground(root: HTMLElement): Promise<void> {
  const img = root.querySelector<HTMLImageElement>("[data-poster-ice-bg]");
  if (!img) return;

  const dataUrl = await loadPosterIceBgAsDataUrl();
  if (img.src !== dataUrl) {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Poster ice bg decode failed"));
      img.src = dataUrl;
    });
  }
  await img.decode().catch(() => undefined);
}
