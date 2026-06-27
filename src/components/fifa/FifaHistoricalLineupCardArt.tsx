import { FifaImageAccentGlow, FifaImageTextScrim, type FifaImageTextScrimVariant } from "@/components/fifa/FifaImageTextScrim";

/** Pozadí karty Historical Lineup — vintage fotka, vybavení a taktická tabule + scrim pro text. */
export function FifaHistoricalLineupCardArt({
  className = "",
  scrim = "hero-left",
}: {
  className?: string;
  scrim?: FifaImageTextScrimVariant | "none";
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/souteze-historical-lineup.png"
        alt=""
        className={`fifa-image-art-photo object-[64%_46%] brightness-[1.02] ${className}`}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      {scrim !== "none" ? <FifaImageTextScrim variant={scrim} /> : null}
      <FifaImageAccentGlow tone="amber" className="-right-[2%] top-[6%] h-[52%] w-[44%] blur-[62px]" />
    </div>
  );
}
