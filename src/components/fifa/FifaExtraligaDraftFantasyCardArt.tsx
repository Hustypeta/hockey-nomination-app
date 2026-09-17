import { FifaImageAccentGlow, FifaImageTextScrim } from "@/components/fifa/FifaImageTextScrim";

/** Pozadí karty Extraliga Draft Fantasy — draft karty na ledě + scrim pro text. */
export function FifaExtraligaDraftFantasyCardArt({ className = "" }: { className?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/soutěže/souteze-extraliga-draft-fantasy.png"
        alt=""
        className={`fifa-image-art-photo object-[72%_center] brightness-[1.05] ${className}`}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <FifaImageTextScrim variant="hero-left" />
      <FifaImageAccentGlow tone="accent" className="-right-[6%] top-[10%] h-[50%] w-[48%]" />
    </div>
  );
}
