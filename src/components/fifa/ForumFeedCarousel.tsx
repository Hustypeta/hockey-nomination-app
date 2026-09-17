"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function readGapPx(el: HTMLElement): number {
  const gap = getComputedStyle(el).rowGap || getComputedStyle(el).gap;
  const parsed = parseFloat(gap);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampIndex(index: number, itemCount: number): number {
  if (itemCount <= 0) return 0;
  return Math.max(0, Math.min(itemCount - 1, index));
}

export function ForumFeedCarousel({
  children,
  itemCount,
  ariaLabel = "Seznam příspěvků",
  arrowsOnly = false,
}: {
  children: ReactNode;
  itemCount: number;
  ariaLabel?: string;
  arrowsOnly?: boolean;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const currentIndex = clampIndex(activeIndex, itemCount);

  const syncScrollState = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    setCanScrollUp(el.scrollTop > 2);
    setCanScrollDown(maxScroll > 2 && el.scrollTop < maxScroll - 2);
  }, []);

  const scrollByStep = useCallback((direction: -1 | 1) => {
    if (arrowsOnly) {
      setActiveIndex(clampIndex(currentIndex + direction, itemCount));
      return;
    }

    const el = listRef.current;
    if (!el) return;

    const firstCard = el.querySelector<HTMLElement>(".fifa-forum-post-card");
    const gap = readGapPx(el);
    const step = firstCard ? firstCard.offsetHeight + gap : el.clientHeight;

    el.scrollBy({ top: direction * step, behavior: "smooth" });
  }, [arrowsOnly, currentIndex, itemCount]);

  useEffect(() => {
    const carousel = carouselRef.current;
    const el = listRef.current;
    if (!carousel || !el || arrowsOnly) return;

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
  }, [arrowsOnly, syncScrollState]);

  useEffect(() => {
    if (arrowsOnly) return;
    const raf = requestAnimationFrame(() => syncScrollState());
    return () => cancelAnimationFrame(raf);
  }, [arrowsOnly, itemCount, syncScrollState]);

  const showArrows = itemCount > 1;
  const canGoPrev = arrowsOnly ? currentIndex > 0 : canScrollUp;
  const canGoNext = arrowsOnly ? currentIndex < itemCount - 1 : canScrollDown;

  const slides = arrowsOnly
    ? Children.map(children, (child, index) => (
        <div
          key={isValidElement(child) && child.key != null ? child.key : index}
          className="fifa-forum-feed__slide"
          hidden={index !== currentIndex}
        >
          {child}
        </div>
      ))
    : children;

  return (
    <div
      ref={carouselRef}
      className={`fifa-forum-feed-carousel${arrowsOnly ? " fifa-forum-feed-carousel--arrows-only" : ""}${
        showArrows ? "" : " fifa-forum-feed-carousel--single"
      }`}
    >
      {showArrows ? (
        <button
          type="button"
          className="fifa-forum-feed-carousel__arrow fifa-forum-feed-carousel__arrow--prev"
          aria-label="Předchozí příspěvek"
          disabled={!canGoPrev}
          onClick={() => scrollByStep(-1)}
        >
          <ChevronUp className="h-5 w-5" aria-hidden />
        </button>
      ) : null}

      <div
        ref={listRef}
        className={`fifa-forum-feed__list${arrowsOnly ? " fifa-forum-feed__list--arrows-only" : ""}`}
        aria-label={ariaLabel}
      >
        {slides}
      </div>

      {showArrows ? (
        <button
          type="button"
          className="fifa-forum-feed-carousel__arrow fifa-forum-feed-carousel__arrow--next"
          aria-label="Další příspěvek"
          disabled={!canGoNext}
          onClick={() => scrollByStep(1)}
        >
          <ChevronDown className="h-5 w-5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
