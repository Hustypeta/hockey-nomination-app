import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DailyNewsSourceBadge } from "@/components/fifa/FifaHomeDailyNewsVisual";
import type { DailyNewsItem } from "@/lib/dailyNews/types";
import { FIFA_BTN_PRIMARY, FIFA_META } from "@/lib/fifa/fifaUiClasses";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type Props = {
  item: DailyNewsItem;
  /** Kompaktní náhled v kartě na úvodu — bez velkého obrázku. */
  compact?: boolean;
};

export function DailyNewsArticleContent({ item, compact = false }: Props) {
  const dateLabel = formatDate(item.publishedAt);

  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5">
      {!compact && item.imageUrl ? (
        <div className="shrink-0 overflow-hidden rounded-xl border border-[var(--fifa-border)] bg-[var(--fifa-bg-base)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            className="aspect-[16/10] w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-[var(--fifa-border)] bg-[var(--fifa-bg-elevated)] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DailyNewsSourceBadge source={item.source} />
          {dateLabel ? <span className={FIFA_META}>{dateLabel}</span> : null}
        </div>
        <h3 className="font-display mt-2 line-clamp-3 text-sm font-semibold leading-snug text-[var(--fifa-text)] lg:text-base">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-2 line-clamp-4 text-[11px] leading-relaxed text-[var(--fifa-text-secondary)] lg:text-xs">
            {item.summary}
          </p>
        ) : null}
      </div>

      <Link
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative z-20 flex w-full shrink-0 items-center justify-center gap-1.5 ${FIFA_BTN_PRIMARY}`}
      >
        Celý článek na {item.source}
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}
