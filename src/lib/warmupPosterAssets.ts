import { waitForPosterFonts } from "@/lib/captureSharePoster";
import {
  jerseyBlankSrcForPool,
  namesPosterBgForPool,
  posterCoachForPool,
} from "@/lib/jerseyPhotoAsset";
import { MATCH_LINEUP_POSTER_RINK_SRC } from "@/lib/matchLineupPosterRinkTemplate";
import { preloadPosterAssets } from "@/lib/posterAssetCache";
import { posterRosterIceBgUrl } from "@/lib/posterRosterIceBg";
import { SITE_LOGO_URL } from "@/lib/siteBranding";

export const LINE_POSTER_BACKGROUND_SRC = "/images/poster-lineup-line-rink-bg.png?v=2";

async function warmupPosterAssetUrls(urls: Array<string | null | undefined>): Promise<void> {
  await Promise.all([preloadPosterAssets(urls), waitForPosterFonts()]);
}

/** Led, dresy, pozadí jmen a logo — jedna dávka před prvním html-to-image. */
export function warmupMatchLineupPosterAssets(poolKey?: string | null): Promise<void> {
  return warmupPosterAssetUrls([
    posterRosterIceBgUrl(),
    jerseyBlankSrcForPool(poolKey, "skater"),
    jerseyBlankSrcForPool(poolKey, "goalie"),
    namesPosterBgForPool(poolKey),
    posterCoachForPool(poolKey).imageSrc,
    LINE_POSTER_BACKGROUND_SRC,
    MATCH_LINEUP_POSTER_RINK_SRC,
    SITE_LOGO_URL,
  ]);
}

/** Forum capture: led jen u dresové varianty, jména jen potřebné pozadí. */
export function warmupForumLineupPosterAssets(payload: {
  kind: "NOMINATION" | "MATCH_LINEUP";
  poolKey?: string | null;
  posterVariant?: "names" | "jerseys";
}): Promise<void> {
  if (payload.kind === "NOMINATION") {
    return warmupPosterAssetUrls([
      jerseyBlankSrcForPool(null, "skater"),
      jerseyBlankSrcForPool(null, "goalie"),
      SITE_LOGO_URL,
    ]);
  }

  const urls: Array<string | null | undefined> = [
    namesPosterBgForPool(payload.poolKey),
    SITE_LOGO_URL,
  ];
  if (payload.posterVariant === "jerseys") {
    urls.push(
      posterRosterIceBgUrl(),
      jerseyBlankSrcForPool(payload.poolKey, "skater"),
      jerseyBlankSrcForPool(payload.poolKey, "goalie"),
      posterCoachForPool(payload.poolKey).imageSrc
    );
  }
  return warmupPosterAssetUrls(urls);
}
