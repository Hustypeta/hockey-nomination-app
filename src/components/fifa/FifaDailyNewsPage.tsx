"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { FifaPageHeader } from "@/components/fifa/FifaPageHeader";
import type { DailyNewsItem } from "@/lib/dailyNews/types";
import { FIFA_BADGE, FIFA_LINK, FIFA_META } from "@/lib/fifa/fifaUiClasses";

export function FifaDailyNewsPage() {
  const [items, setItems] = useState<DailyNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/daily-news?limit=30", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { items?: DailyNewsItem[] }) => {
        if (!cancelled) setItems(d.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <FifaAppPage fitViewport={false} className="fifa-panel-scroll">
      <div className="mx-auto w-full max-w-2xl">
        <FifaPageHeader
          kicker="Agregace z webů"
          title="Lineup News"
          subtitle="Zprávy a přestupy ze světa hokeje — Sport.cz, Livesport.cz, ČT Sport a NHL.com/cs. Kliknutím otevřeš původní článek."
          align="center"
        />

        {loading ? (
          <p className={`${FIFA_META} py-12 text-center`}>Načítám zprávy…</p>
        ) : items.length === 0 ? (
          <p className="fifa-empty-state text-sm">Zprávy se teď nepodařilo načíst. Zkus obnovit stránku.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fifa-card fifa-card--interactive group block p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={FIFA_BADGE}>{item.source}</span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-[var(--fifa-text-muted)] transition group-hover:text-[var(--fifa-accent-text)]" aria-hidden />
                  </div>
                  <h2 className="mt-2 font-display text-lg leading-tight text-[var(--fifa-text)] group-hover:text-[var(--fifa-accent-text)]">
                    {item.title}
                  </h2>
                  {item.summary ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--fifa-text-secondary)]">{item.summary}</p>
                  ) : null}
                  {item.publishedAt ? (
                    <p className={`${FIFA_META} mt-2`}>{new Date(item.publishedAt).toLocaleString("cs-CZ")}</p>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className={`${FIFA_META} mt-8 text-center`}>
          <Link href="/" className={FIFA_LINK}>
            ← Zpět na úvod
          </Link>
        </p>
      </div>
    </FifaAppPage>
  );
}
