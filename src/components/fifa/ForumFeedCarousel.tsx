"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function readGapPx(el: HTMLElement): number {
  const gap = getComputedStyle(el).rowGap || getComputedStyle(el).gap;
  const parsed = parseFloat(gap);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ForumFeedCarousel({
  children,
  itemCount,
  ariaLabel = "Seznam příspěvků",
}: {
  children: ReactNode;
  itemCount: number;
  ariaLabel?: string;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const syncScrollState = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    setCanScrollUp(el.scrollTop > 2);
    setCanScrollDown(maxScroll > 2 && el.scrollTop < maxScroll - 2);
  }, []);

  const scrollByStep = useCallback((direction: -1 | 1) => {
    const el = listRef.current;
    if (!el) return;

    const firstCard = el.querySelector<HTMLElement>(".fifa-forum-post-card");
    const gap = readGapPx(el);
    const step = firstCard ? firstCard.offsetHeight + gap : el.clientHeight;

    el.scrollBy({ top: direction * step, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    const el = listRef.current;
    if (!carousel || !el) return;

    syncScrollState();

    const onScroll = () => syncScrollState();
    const onWheel = (e: WheelEvent) => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 1) return;

      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;

      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop >= maxScroll - 1;
      if ((delta < 0 && atTop) || (delta > 0 && atBottom)) return;

      e.preventDefault();
      e.stopPropagation();
      el.scrollTop += delta;
    };

    const observer = new ResizeObserver(() => syncScrollState());

    el.addEventListener("scroll", onScroll, { passive: true });
    carousel.addEventListener("wheel", onWheel, { passive: false, capture: true });
    observer.observe(el);
    if (el.firstElementChild) {
      observer.observe(el.firstElementChild);
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      carousel.removeEventListener("wheel", onWheel, { capture: true });
      observer.disconnect();
    };
  }, [syncScrollState]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => syncScrollState());
    return () => cancelAnimationFrame(raf);
  }, [itemCount, syncScrollState]);

  return (
    <div ref={carouselRef} className="fifa-forum-feed-carousel">
      <button
        type="button"
        className="fifa-forum-feed-carousel__arrow fifa-forum-feed-carousel__arrow--prev"
        aria-label="Předchozí příspěvek"
        disabled={!canScrollUp}
        onClick={() => scrollByStep(-1)}
      >
        <ChevronUp className="h-5 w-5" aria-hidden />
      </button>

      <div ref={listRef} className="fifa-forum-feed__list" aria-label={ariaLabel}>
        {children}
      </div>

      <button
        type="button"
        className="fifa-forum-feed-carousel__arrow fifa-forum-feed-carousel__arrow--next"
        aria-label="Další příspěvek"
        disabled={!canScrollDown}
        onClick={() => scrollByStep(1)}
      >
        <ChevronDown className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
