import {
  NOMINATION_PROMO_OG_ALT,
  NOMINATION_PROMO_OG_SIZE,
  renderNominationPromoOg,
} from "@/lib/nominationPromoOg";

export const alt = NOMINATION_PROMO_OG_ALT;
export const size = NOMINATION_PROMO_OG_SIZE;
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image() {
  return renderNominationPromoOg();
}
