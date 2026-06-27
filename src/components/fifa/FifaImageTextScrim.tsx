/** Více-stopové gradienty pro čitelný text nad fotkou (Material / editorial pattern). */
export type FifaImageTextScrimVariant = "hero-left" | "hero-center" | "media-bottom" | "panel-left";

type FifaImageTextScrimProps = {
  variant?: FifaImageTextScrimVariant;
  className?: string;
};

export function FifaImageTextScrim({ variant = "hero-left", className = "" }: FifaImageTextScrimProps) {
  return (
    <div
      className={`fifa-image-text-scrim fifa-image-text-scrim--${variant} ${className}`.trim()}
      aria-hidden
    />
  );
}

type FifaImageAccentGlowProps = {
  tone?: "accent" | "cyan" | "amber";
  className?: string;
};

/** Jemné barevné prosvětlení v rohu — fotka zůstává viditelná, text má hloubku. */
export function FifaImageAccentGlow({ tone = "accent", className = "" }: FifaImageAccentGlowProps) {
  return (
    <div
      className={`fifa-image-accent-glow fifa-image-accent-glow--${tone} ${className}`.trim()}
      aria-hidden
    />
  );
}
