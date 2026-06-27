"use client";

import type { MouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type FifaHomeCarouselNavProps = {
  onPrev: (e: MouseEvent<HTMLButtonElement>) => void;
  onNext: (e: MouseEvent<HTMLButtonElement>) => void;
  prevLabel: string;
  nextLabel: string;
  /** `overlay` — nad fotkou; `chrome` — dlaždicový styl */
  variant?: "overlay" | "chrome";
  /**
   * `hero` — mezi horním štítkem a spodním textem (výchozí)
   * `media` — nad spodním titulkem u fotky
   * `full` — celá výška karty (s odsazením obsahu)
   */
  align?: "hero" | "media" | "full";
  className?: string;
};

export function FifaHomeCarouselNav({
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  variant = "chrome",
  align = "hero",
  className = "",
}: FifaHomeCarouselNavProps) {
  const btnClass =
    variant === "overlay"
      ? "fifa-home-carousel-nav__btn fifa-home-carousel-nav__btn--overlay"
      : "fifa-home-carousel-nav__btn fifa-home-carousel-nav__btn--chrome";

  const alignClass =
    align === "media"
      ? "fifa-home-carousel-nav--media"
      : align === "full"
        ? "fifa-home-carousel-nav--full"
        : "fifa-home-carousel-nav--hero";

  return (
    <div className={`fifa-home-carousel-nav ${alignClass} ${className}`.trim()} aria-hidden={false}>
      <button type="button" onClick={onPrev} className={btnClass} aria-label={prevLabel}>
        <ChevronLeft className="fifa-home-carousel-nav__icon" aria-hidden />
      </button>
      <button type="button" onClick={onNext} className={btnClass} aria-label={nextLabel}>
        <ChevronRight className="fifa-home-carousel-nav__icon" aria-hidden />
      </button>
    </div>
  );
}
