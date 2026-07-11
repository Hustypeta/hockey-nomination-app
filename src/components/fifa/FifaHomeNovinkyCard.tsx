"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Megaphone, X } from "lucide-react";
import { SiteNewsArticleContent } from "@/components/fifa/SiteNewsArticleContent";
import { FifaHomeCarouselNav } from "@/components/fifa/FifaHomeCarouselNav";
import { FifaImageTextScrim } from "@/components/fifa/FifaImageTextScrim";
import { getSiteNewsForHome, SITE_NEWS_PRODUCT_NAME } from "@/lib/siteNews/entries";
import type { SiteNewsItem } from "@/lib/siteNews/types";
import { FIFA_KICKER } from "@/lib/fifa/fifaUiClasses";

const ROTATE_MS = 7000;

type PanelMode = "closed" | "detail";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "short",
  });
}

export function FifaHomeNovinkyCard({
  embedded = false,
  onDetailOpenChange,
  hideHeaderBadge = false,
}: {
  /** Vnořené v rotátoru — bez vlastního `.fifa-card` obalu. */
  embedded?: boolean;
  onDetailOpenChange?: (open: boolean) => void;
  /** Skryje horní badge (rotátor ukazuje vlastní štítek). */
  hideHeaderBadge?: boolean;
} = {}) {
  const items = getSiteNewsForHome();
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [panel, setPanel] = useState<PanelMode>("closed");

  const showArrows = items.length > 1;

  const goToIndex = useCallback(
    (next: number) => {
      if (items.length === 0) return;
      const i = ((next % items.length) + items.length) % items.length;
      if (i === index) return;
      setFade(false);
      setTimeout(() => {
        setIndex(i);
        setFade(true);
      }, 200);
    },
    [index, items.length],
  );

  const goPrev = useCallback(() => goToIndex(index - 1), [goToIndex, index]);
  const goNext = useCallback(() => goToIndex(index + 1), [goToIndex, index]);

  const openDetail = useCallback(() => {
    setPanel("detail");
    onDetailOpenChange?.(true);
  }, [onDetailOpenChange]);

  const closeDetail = useCallback(() => {
    setPanel("closed");
    onDetailOpenChange?.(false);
  }, [onDetailOpenChange]);

  useEffect(() => {
    if (items.length < 2 || panel !== "closed") return;
    let swap: ReturnType<typeof setTimeout> | undefined;
    const t = setInterval(() => {
      setFade(false);
      swap = setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setFade(true);
      }, 280);
    }, ROTATE_MS);
    return () => {
      clearInterval(t);
      if (swap) clearTimeout(swap);
    };
  }, [items.length, panel]);

  const item = items[index]!;

  const navArrows = (extraClass = "") =>
    showArrows ? (
      <FifaHomeCarouselNav
        onPrev={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goPrev();
        }}
        onNext={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goNext();
        }}
        prevLabel="Předchozí novinka"
        nextLabel="Další novinka"
        variant="chrome"
        className={extraClass}
      />
    ) : null;

  const preview = (entry: SiteNewsItem) => {
    const promoVisual = entry.homeImageOnly || entry.homeImageContain;

    return (
    <div
      className={`relative flex h-full min-h-0 w-full flex-col transition-opacity duration-300 ${
        fade ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative min-h-0 flex-1 overflow-hidden${
          promoVisual ? " fifa-home-novinky-promo-frame" : ""
        }`}
      >
        {entry.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.imageUrl}
              alt=""
              className={`fifa-image-art-photo fifa-home-tile-media ${
                promoVisual ? "fifa-home-novinky-promo" : "object-[center_42%]"
              }`}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            {entry.homeImageOnly ? (
              <button
                type="button"
                onClick={openDetail}
                className="absolute inset-0 z-10 cursor-pointer"
                aria-label={`${entry.title} — číst více`}
              />
            ) : null}
            {entry.homeImageOnly ? null : <FifaImageTextScrim variant="media-bottom" />}
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[var(--fifa-bg-surface)]">
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_85%_15%,rgba(37,99,235,0.12),transparent_60%)]" aria-hidden />
            </div>
            <FifaImageTextScrim variant="media-bottom" />
          </>
        )}

        {navArrows()}

        <div className="fifa-image-text-zone fifa-image-text-zone--top pointer-events-none flex items-start justify-between gap-2 p-2.5 lg:p-3">
          {!hideHeaderBadge ? (
            <span className="fifa-badge max-w-[min(100%,11rem)] truncate" title={SITE_NEWS_PRODUCT_NAME}>
              <Megaphone className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">Novinky z platformy</span>
            </span>
          ) : (
            <span aria-hidden />
          )}
          {showArrows && !hideHeaderBadge ? (
            <span className="fifa-meta tabular-nums">{index + 1}/{items.length}</span>
          ) : null}
        </div>

        {!entry.homeImageOnly ? (
          <div
            className={`fifa-image-text-zone fifa-image-text-zone--bottom px-2.5 pb-2 pt-10 lg:px-3 lg:pb-2.5 ${
              showArrows ? "fifa-home-carousel-content--nav" : ""
            } ${entry.imageUrl ? "pointer-events-auto" : "pointer-events-none"}`}
          >
            {entry.imageUrl ? (
              <>
                <p className="font-display fifa-image-text-shadow line-clamp-2 text-sm font-semibold leading-snug text-white lg:text-base">
                  {entry.summary}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button type="button" onClick={openDetail} className="fifa-btn-ghost text-[var(--fifa-accent-text)]">
                    Číst více
                    <ArrowUpRight className="h-3 w-3" aria-hidden />
                  </button>
                  <span className="fifa-meta text-[var(--fifa-text-secondary)]">{formatDate(entry.publishedAt)}</span>
                </div>
              </>
            ) : (
              <span className="fifa-badge">{entry.tag}</span>
            )}
          </div>
        ) : null}
      </div>

      {!entry.imageUrl ? (
        <div className="relative z-10 shrink-0 border-t border-[var(--fifa-border)] bg-[var(--fifa-bg-surface)] px-3 py-2 fifa-home-carousel-content--nav">
          <p className="font-display line-clamp-2 text-sm font-semibold leading-snug text-[var(--fifa-text)] lg:text-base">
            {entry.summary}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <button type="button" onClick={openDetail} className="fifa-btn-ghost text-[var(--fifa-accent-text)]">
              Číst více
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </button>
            <span className="fifa-meta">{formatDate(entry.publishedAt)}</span>
          </div>
        </div>
      ) : null}
    </div>
    );
  };

  const body = (
    <>
      {panel === "detail" ? (
        <div
          className="absolute inset-0 z-30 flex min-h-0 flex-col overflow-hidden bg-[var(--fifa-bg-base)]"
          role="dialog"
          aria-label={item.title}
        >
          <div className="fifa-card-header !rounded-none !border-x-0 !border-t-0">
            <p className={FIFA_KICKER}>Novinky z platformy</p>
            <button
              type="button"
              onClick={closeDetail}
              className="fifa-btn-ghost flex h-7 w-7 items-center justify-center !p-0"
              aria-label="Zavřít"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto fifa-card-panel-scroll">
            {navArrows()}
            <div
              className={`relative z-10 px-3 py-3 transition-opacity duration-300 lg:px-4 lg:py-4 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              <SiteNewsArticleContent item={item} variant="homeCard" showImage={false} />
            </div>
          </div>
        </div>
      ) : null}

      <div className={panel === "detail" ? "invisible h-0 overflow-hidden" : "h-full min-h-0"}>
        {preview(item)}
      </div>
    </>
  );

  if (embedded) {
    return <div className="relative h-full min-h-0 overflow-hidden">{body}</div>;
  }

  return (
    <article className="fifa-card fifa-card--interactive fifa-home-novinky-card group relative h-full min-h-0 overflow-hidden">
      {body}
    </article>
  );
}
