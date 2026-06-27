"use client";

import { useCallback, useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import {
  HOME_FRIEND_REFERRAL_PREVIEW,
  type HomeFriendReferralPreview,
} from "@/lib/friendReferral/homePreviewEntries";
import { FifaHomeCarouselNav } from "@/components/fifa/FifaHomeCarouselNav";

const ROTATE_MS = 6500;

export function FifaHomeReferFriendCard() {
  const items = HOME_FRIEND_REFERRAL_PREVIEW;
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const showArrows = items.length > 1;
  const item = items[index]!;

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

  useEffect(() => {
    if (items.length < 2) return;
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
  }, [items.length]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={`relative flex h-full min-h-0 w-full flex-col transition-opacity duration-300 ease-out ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="absolute inset-0 bg-[var(--fifa-bg-surface)]">
            <span
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_85%_15%,rgba(37,99,235,0.12),transparent_60%)]"
              aria-hidden
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[var(--fifa-bg-chrome)] via-[var(--fifa-bg-chrome)]/85 to-transparent" aria-hidden />

          {showArrows ? (
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
              prevLabel="Předchozí slide"
              nextLabel="Další slide"
              variant="chrome"
            />
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-end gap-2 p-2.5 lg:p-3">
            {showArrows ? (
              <span className="fifa-meta tabular-nums">
                {index + 1}/{items.length}
              </span>
            ) : null}
          </div>

          <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 px-2.5 pb-2 pt-8 lg:px-3 lg:pb-2.5 fifa-home-carousel-content--nav`}>
            <ReferFriendPreviewHero entry={item} />
          </div>
        </div>

        <div className="relative z-10 shrink-0 border-t border-[var(--fifa-border)] bg-[var(--fifa-bg-chrome)] px-3 py-2 fifa-home-carousel-content--nav">
          <p className="line-clamp-2 text-[11px] leading-relaxed text-[var(--fifa-text-secondary)]">{item.summary}</p>
        </div>
      </div>
    </div>
  );
}

function ReferFriendPreviewHero({ entry }: { entry: HomeFriendReferralPreview }) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--fifa-border)] bg-[var(--fifa-bg-elevated)] text-[var(--fifa-accent-text)] lg:h-14 lg:w-14">
        <Share2 className="h-6 w-6 lg:h-7 lg:w-7" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <span className="fifa-badge">{entry.tag}</span>
        <h3 className="font-display mt-2 line-clamp-2 text-[0.95rem] font-semibold leading-snug text-[var(--fifa-text)] lg:text-base">
          {entry.title}
        </h3>
        <p className="mt-1 text-[11px] text-[var(--fifa-text-muted)]">{entry.subtitle}</p>
      </div>
    </div>
  );
}
