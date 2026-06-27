"use client";

import Link from "next/link";
import { Megaphone } from "lucide-react";
import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { FifaPageHeader } from "@/components/fifa/FifaPageHeader";
import { SITE_NEWS_ENTRIES, SITE_NEWS_PRODUCT_NAME } from "@/lib/siteNews/entries";
import { FIFA_BADGE, FIFA_LINK, FIFA_META } from "@/lib/fifa/fifaUiClasses";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function FifaNovinkyPage() {
  return (
    <FifaAppPage fitViewport={false} className="fifa-panel-scroll">
      <div className="mx-auto w-full max-w-2xl">
        <FifaPageHeader
          kicker="Hokej Lineup"
          title={SITE_NEWS_PRODUCT_NAME}
          subtitle="Co je nového v aplikaci — redesign, funkce a další změny. Hokejové zprávy z webů najdeš v Lineup News."
          align="center"
        />

        <p className={`${FIFA_META} mb-6 text-center`}>
          Agregované zprávy z médií:{" "}
          <Link href="/daily-news" className={FIFA_LINK}>
            Lineup News →
          </Link>
        </p>

        <ul className="space-y-3">
          {SITE_NEWS_ENTRIES.map((item) => (
            <li key={item.id}>
              <div className="fifa-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className={FIFA_BADGE}>
                    <Megaphone className="h-3 w-3" aria-hidden />
                    {item.tag}
                  </span>
                  <span className={`${FIFA_META} shrink-0`}>{formatDate(item.publishedAt)}</span>
                </div>
                <h2 className="mt-2 font-display text-lg leading-tight text-[var(--fifa-text)]">{item.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--fifa-text-secondary)]">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className={`${FIFA_META} mt-8 text-center`}>
          <Link href="/" className={FIFA_LINK}>
            ← Zpět na úvod
          </Link>
        </p>
      </div>
    </FifaAppPage>
  );
}
