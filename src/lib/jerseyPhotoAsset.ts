/** Zadní strana českého dresu (PNG v `public/images/`) — jméno a číslo se kreslí v `PremiumJerseySlotCard`. */
export const CZ_JERSEY_BACK_BLANK_SRC = "/images/cz-jersey-squad-compact.png";

/**
 * PNG je široký — `object-contain` nechával nahoře malý dres a dole velký černý pruh.
 * `object-cover` + `object-top` dres zvětší a ořízne boční „prázdno“; stejné ve všech kartách.
 */
export const CZ_JERSEY_CARD_IMG_BASE =
  "absolute inset-0 h-full w-full object-cover object-top";
