"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, ChevronLeft, X } from "lucide-react";
import { SiteNewsArticleContent } from "@/components/fifa/SiteNewsArticleContent";
import {
  markSiteNewsNotificationsSeen,
  NOTIFICATIONS_SEEN_KEY,
  SITE_NEWS_ENTRIES,
  SITE_NEWS_PRODUCT_NAME,
} from "@/lib/siteNews/entries";
import type { SiteNewsItem } from "@/lib/siteNews/types";
import { FIFA_BADGE, FIFA_KICKER, FIFA_META } from "@/lib/fifa/fifaUiClasses";

function formatNotifyDate(iso: string): string {
  return new Date(iso).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "short",
  });
}

export function FifaNotificationsBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [detailItem, setDetailItem] = useState<SiteNewsItem | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const refreshUnread = useCallback(() => {
    const seenAt = localStorage.getItem(NOTIFICATIONS_SEEN_KEY);
    if (!seenAt) {
      setUnread(SITE_NEWS_ENTRIES.length);
      return;
    }
    const seenMs = Date.parse(seenAt);
    if (!Number.isFinite(seenMs)) {
      setUnread(SITE_NEWS_ENTRIES.length);
      return;
    }
    setUnread(
      SITE_NEWS_ENTRIES.filter((e) => Date.parse(e.publishedAt) > seenMs).length
    );
  }, []);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setDetailItem(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (detailItem) setDetailItem(null);
        else setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, detailItem]);

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next) {
        markSiteNewsNotificationsSeen();
        setUnread(0);
      } else {
        setDetailItem(null);
      }
      return next;
    });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition lg:h-9 lg:w-9 ${
          open
            ? "border-[var(--fifa-accent)]/40 bg-[var(--fifa-accent-muted)] text-[var(--fifa-text)]"
            : "border-[var(--fifa-border)] bg-[var(--fifa-bg-elevated)] text-[var(--fifa-text-secondary)] hover:bg-[var(--fifa-bg-hover)]"
        }`}
        aria-label="Notifikace — novinky platformy"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unread > 0 ? (
          <span
            className="absolute right-1 top-1 flex h-2 min-w-[0.5rem] items-center justify-center rounded-full bg-red-600 px-0.5 text-[8px] font-bold text-white ring-2 ring-[var(--fifa-bg-base)]"
            aria-hidden
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="fifa-popover absolute right-0 top-[calc(100%+0.5rem)] z-[100] w-[min(20rem,calc(100vw-1.5rem))]"
          role="dialog"
          aria-label={detailItem ? detailItem.title : SITE_NEWS_PRODUCT_NAME}
        >
          <div className="fifa-card-header !rounded-none !border-x-0 !border-t-0">
            {detailItem ? (
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--fifa-accent-text)] transition hover:text-[var(--fifa-text)]"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                Zpět
              </button>
            ) : (
              <div>
                <p className={FIFA_KICKER}>Notifikace</p>
                <p className="font-display mt-0.5 text-sm leading-tight text-[var(--fifa-text)]">
                  {SITE_NEWS_PRODUCT_NAME}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setDetailItem(null);
              }}
              className="fifa-btn-ghost flex h-7 w-7 items-center justify-center !p-0"
              aria-label="Zavřít"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          <div className="fifa-panel-scroll max-h-[min(18rem,55vh)] px-3 py-2">
            {detailItem ? (
              <SiteNewsArticleContent item={detailItem} />
            ) : SITE_NEWS_ENTRIES.length === 0 ? (
              <p className={`${FIFA_META} py-4 text-center`}>Žádné novinky.</p>
            ) : (
              <ul className="space-y-1">
                {SITE_NEWS_ENTRIES.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setDetailItem(item)}
                      className="w-full rounded-lg px-1 py-2.5 text-left transition hover:bg-[var(--fifa-bg-hover)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={FIFA_BADGE}>{item.tag}</span>
                        <span className={`${FIFA_META} shrink-0`}>{formatNotifyDate(item.publishedAt)}</span>
                      </div>
                      <p className="mt-1 text-xs font-semibold leading-snug text-[var(--fifa-text)]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[var(--fifa-text-secondary)]">
                        {item.notificationShort}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
