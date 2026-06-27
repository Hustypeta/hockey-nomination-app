import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, type LucideIcon } from "lucide-react";
import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { FifaHubCard } from "@/components/fifa/FifaHubCard";
import { FIFA_LINK } from "@/lib/fifa/fifaUiClasses";

export type FifaSubHubCard = {
  href: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  badge?: string;
  art?: ReactNode;
};

/** Mezistránka rozcestí soutěží — zpět odkaz, hlavička a karty (nebo prázdný stav). */
export function FifaSubHubContent({
  backHref,
  backLabel = "Zpět",
  kicker,
  title,
  subtitle,
  cards = [],
  menuCards = [],
  note,
}: {
  backHref: string;
  backLabel?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  cards?: FifaSubHubCard[];
  /** Karty s vnořeným menu po najetí (např. MS 2026). */
  menuCards?: ReactNode[];
  note?: string;
}) {
  const hasCards = cards.length > 0 || menuCards.length > 0;
  const itemCount = cards.length + menuCards.length;
  const gridClass =
    itemCount <= 2
      ? "mt-4 grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-8 lg:max-w-5xl lg:gap-5"
      : "mt-4 grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3 lg:gap-4";

  return (
    <FifaAppPage>
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0">
          <Link
            href={backHref}
            className={`inline-flex items-center gap-1 text-xs font-semibold lg:text-sm ${FIFA_LINK}`}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {backLabel}
          </Link>
          <div className="fifa-page-heading mt-4">
            {kicker ? <p className="fifa-kicker">{kicker}</p> : null}
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </div>

        {hasCards ? (
          <div className={gridClass}>
            {menuCards.map((node, i) => (
              <div key={`menu-${i}`} className="flex min-h-0 flex-col">
                {node}
              </div>
            ))}
            {cards.map((card) => (
              <div key={card.href} className="flex min-h-0 flex-col">
                <FifaHubCard {...card} compact />
              </div>
            ))}
          </div>
        ) : note ? (
          <div className="mt-6 flex flex-1 items-center justify-center lg:py-10">
            <p className="max-w-md text-center text-sm leading-relaxed text-[var(--fifa-text-secondary)]">
              {note}
            </p>
          </div>
        ) : null}
      </div>
    </FifaAppPage>
  );
}
