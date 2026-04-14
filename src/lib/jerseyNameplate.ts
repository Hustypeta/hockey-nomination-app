/**
 * Společná škálování příjmení na zadní straně dresu — čím delší text, tím menší písmo
 * a užší mezery, aby zůstal uvnitř „nášivky“.
 */
export function jerseyNameplateExtraClasses(lastName: string): string {
  const n = lastName.trim().length;
  if (n <= 5) return "max-w-[92%]";
  if (n <= 7) return "max-w-[93%] !text-[10px] sm:!text-[11px] !leading-[1.05] !tracking-[0.1em]";
  if (n <= 9) return "max-w-[94%] !text-[9px] sm:!text-[10px] !leading-[1.05] !tracking-[0.085em]";
  if (n <= 11) return "max-w-[95%] !text-[8px] sm:!text-[9px] !leading-[1.08] !tracking-[0.07em]";
  if (n <= 13) return "max-w-[96%] !text-[7.5px] sm:!text-[8.5px] !leading-[1.08] !tracking-[0.06em] line-clamp-2";
  if (n <= 16)
    return "max-w-[98%] !text-[7px] sm:!text-[8px] !leading-[1.08] !tracking-[0.055em] line-clamp-2 break-words";
  return "max-w-[98%] !text-[6.5px] sm:!text-[7.5px] !leading-[1.06] !tracking-[0.045em] line-clamp-2 break-words hyphens-auto";
}

/** Menší číslo při extrémně dlouhém příjmení, aby se nepřekrývalo s okrajem. */
export function jerseyNumberExtraClasses(lastName: string): string {
  const n = lastName.trim().length;
  if (n <= 11) return "";
  if (n <= 14) return " !text-[26px] sm:!text-[28px]";
  return " !text-[24px] sm:!text-[26px]";
}
