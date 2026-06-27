"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import {
  DailyNewsSourceBadge,
  FifaHomeDailyNewsVisual,
} from "@/components/fifa/FifaHomeDailyNewsVisual";
import { FifaHomeCarouselNav } from "@/components/fifa/FifaHomeCarouselNav";
import type { DailyNewsItem } from "@/lib/dailyNews/types";
import { DAILY_NEWS_HOME_COUNT } from "@/lib/dailyNews/feeds";
import { FIFA_LINK, FIFA_META } from "@/lib/fifa/fifaUiClasses";

const ROTATE_MS = 6500;

export function FifaHomeDailyNews() {
  const [items, setItems] = useState<DailyNewsItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fade, setFade] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/daily-news?limit=${DAILY_NEWS_HOME_COUNT}&enrich=1`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load"))))
      .then((data: { items?: DailyNewsItem[] }) => {
        if (cancelled) return;
        const list = (data.items ?? []).slice(0, DAILY_NEWS_HOME_COUNT);
        setItems(list.length > 0 ? list : []);
        setError(list.length === 0);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const step = useCallback(
    (delta: number) => (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      goToIndex(index + delta);
    },
    [goToIndex, index],
  );

  useEffect(() => {
    if (items.length < 2 || paused) return;
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
  }, [items.length, paused]);

  const item = items[index];

  return (
    <article
      className="fifa-card fifa-card--interactive group relative h-full min-h-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {loading ? (
        <div className="flex h-full flex-col">
          <div className="relative min-h-0 flex-1 animate-pulse bg-[var(--fifa-bg-surface)]" />
          <div className="space-y-2 border-t border-[var(--fifa-border)] p-3">
            <div className="h-3 w-16 rounded bg-[var(--fifa-bg-hover)]" />
            <div className="h-4 w-full rounded bg-[var(--fifa-bg-hover)]" />
            <div className="h-3 w-[80%] rounded bg-[var(--fifa-bg-elevated)]" />
          </div>
        </div>
      ) : error || !item ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
          <Newspaper className="h-8 w-8 text-[var(--fifa-accent)]/40" aria-hidden />
          <p className={`${FIFA_META} text-xs leading-snug`}>
            Zprávy se nepodařilo načíst.{" "}
            <Link href="/daily-news" className={FIFA_LINK}>
              Archiv
            </Link>
          </p>
        </div>
      ) : (
        <>
          {/* Celé okno = proklik na článek */}
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.title}
            className="absolute inset-0 z-20"
          />

          <div
            className={`relative h-full min-h-0 w-full transition-opacity duration-300 ease-out ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            <FifaHomeDailyNewsVisual
              key={`${item.id}-${item.imageUrl ?? "none"}`}
              imageUrl={item.imageUrl}
              source={item.source}
            />

            <div className="fifa-image-text-zone fifa-image-text-zone--top pointer-events-none flex items-start justify-between gap-2 p-2.5 lg:p-3">
              <span className="flex items-center gap-2">
                <span className="fifa-icon-chip">
                  <Newspaper className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="fifa-kicker fifa-image-kicker text-[var(--fifa-text)]">Lineup News</span>
              </span>
              {showArrows ? (
                <span className="fifa-meta fifa-image-meta-chip tabular-nums px-1.5 py-0.5 text-[var(--fifa-text)]">
                  {index + 1}/{items.length}
                </span>
              ) : null}
            </div>

            <div className={`fifa-image-text-zone fifa-image-text-zone--bottom pointer-events-none px-3 pb-3 pt-14 ${showArrows ? "fifa-home-carousel-content--nav" : ""}`}>
              <DailyNewsSourceBadge source={item.source} />
              {item.summary ? (
                <p className="fifa-image-text-muted mt-2 line-clamp-3 max-w-[96%] text-[11px] leading-relaxed lg:text-xs">
                  {item.summary}
                </p>
              ) : null}
              <h3 className="font-display fifa-image-text-shadow--strong mt-1.5 line-clamp-3 text-sm font-semibold leading-snug text-[var(--fifa-text)] lg:text-base">
                {item.title}
              </h3>
            </div>
          </div>

          {/* Velké navigační šipky nad prokliknutím */}
          {showArrows ? (
            <FifaHomeCarouselNav
              onPrev={step(-1)}
              onNext={step(1)}
              prevLabel="Předchozí zpráva"
              nextLabel="Další zpráva"
              variant="overlay"
              align="media"
            />
          ) : null}
        </>
      )}
    </article>
  );
}
