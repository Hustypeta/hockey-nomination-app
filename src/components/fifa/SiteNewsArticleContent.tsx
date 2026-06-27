import type { SiteNewsItem } from "@/lib/siteNews/types";
import { FIFA_BADGE, FIFA_META } from "@/lib/fifa/fifaUiClasses";

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type SiteNewsArticleContentProps = {
  item: SiteNewsItem;
  /** Karta na úvodu — celý text, větší písmo, vyplní výšku. */
  variant?: "default" | "homeCard";
  /** Náhled už ukazuje obrázek — v detailu ho defaultně neopakujeme. */
  showImage?: boolean;
};

export function SiteNewsArticleContent({
  item,
  variant = "default",
  showImage = variant !== "homeCard",
}: SiteNewsArticleContentProps) {
  const paragraphs = item.body.split(/\n\n+/).map((para) => para.trim()).filter(Boolean);
  const headline = item.summary || item.title;

  if (variant === "homeCard") {
    return (
      <div className="flex min-h-0 flex-col gap-3 lg:gap-4">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <span className={FIFA_BADGE}>{item.tag}</span>
          <span className={FIFA_META}>{formatDateLong(item.publishedAt)}</span>
        </div>

        {showImage && item.imageUrl ? (
          <div className="relative aspect-[16/10] shrink-0 overflow-hidden rounded-[var(--fifa-radius-md)] border border-[var(--fifa-border)] bg-[var(--fifa-bg-surface)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover object-center"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
        ) : null}

        <h3 className="shrink-0 font-display text-[1.35rem] font-semibold leading-[1.12] text-[var(--fifa-text)] lg:text-[1.55rem]">
          {headline}
        </h3>

        <div className="flex min-h-0 flex-col gap-3 lg:gap-3.5">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-sm leading-[1.55] text-[var(--fifa-text-secondary)] lg:text-[0.95rem] lg:leading-[1.62]"
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={FIFA_BADGE}>{item.tag}</span>
        <span className={FIFA_META}>{formatDateLong(item.publishedAt)}</span>
      </div>
      <h3 className="font-display text-base font-semibold leading-snug text-[var(--fifa-text)] lg:text-lg">
        {item.title}
      </h3>
      {item.imageUrl ? (
        <div className="overflow-hidden rounded-[var(--fifa-radius-md)] border border-[var(--fifa-border)] bg-[var(--fifa-bg-surface)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            className="aspect-[16/10] w-full object-cover object-center"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>
      ) : null}
      <div className="space-y-2.5 text-[11px] leading-relaxed text-[var(--fifa-text-secondary)] lg:text-xs lg:leading-relaxed">
        {paragraphs.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
