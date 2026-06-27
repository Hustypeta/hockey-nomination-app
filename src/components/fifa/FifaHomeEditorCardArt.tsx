import { FifaImageAccentGlow, FifaImageTextScrim } from "@/components/fifa/FifaImageTextScrim";

/** Pozadí karty editoru — fotka ledu s FUT štíty + scrim pro čitelnost textu. */
export function FifaHomeEditorCardArt({ className = "" }: { className?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- dekorativní statický asset z /public */}
      <img
        src="/images/home-editor-rink.png"
        alt=""
        className={`fifa-image-art-photo object-[72%_center] ${className}`}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <FifaImageTextScrim variant="hero-left" />
      <FifaImageAccentGlow tone="cyan" className="-right-[6%] top-[2%] h-[60%] w-[55%]" />
    </div>
  );
}
