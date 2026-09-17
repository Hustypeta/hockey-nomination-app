/** Partnerský redirect Tipsport (loading page / úvod). */
export const TIPSPORT_PARTNER_HREF =
  "https://www.tipsport.cz/PartnerRedirectAction.do?pid=35494&sid=45500&bid=52965&tid=11879&urlid=17336";

/**
 * Obrázek banneru — `public/images/promo/tipsport-banner.png` (skutečné PNG),
 * případně env `NEXT_PUBLIC_TIPSPORT_BANNER_IMAGE_SRC`.
 */
export const TIPSPORT_BANNER_IMAGE_SRC =
  process.env.NEXT_PUBLIC_TIPSPORT_BANNER_IMAGE_SRC?.trim() || "/images/promo/tipsport-banner.png";
