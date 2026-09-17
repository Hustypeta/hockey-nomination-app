"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Loader2, type LucideIcon } from "lucide-react";
import { FifaRepreHeroHeadline } from "@/components/fifa/FifaRepreHeroHeadline";

export type FifaHubMenuItem = {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
};

function FifaHubMenuItemRow({
  item,
  ended,
  preparing,
  onNavigate,
}: {
  item: FifaHubMenuItem;
  ended: boolean;
  preparing: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const inactive = ended || preparing;

  const content = (
    <>
      <span className="fifa-repre-menu__icon">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-display text-sm font-bold leading-tight text-[var(--fifa-text)] lg:text-base">
          {item.label}
        </span>
        {ended ? (
          <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-rose-300/90 lg:text-[11px]">
            Uzavřeno
          </span>
        ) : preparing ? (
          <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-amber-200/90 lg:text-[11px]">
            Soutěže připravujeme
          </span>
        ) : (
          <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-[var(--fifa-text-muted)] lg:text-[11px]">
            {item.hint}
          </span>
        )}
      </span>
      {!inactive ? (
        <ChevronRight
          className="h-4 w-4 shrink-0 text-[var(--fifa-accent-text)] opacity-70 transition group-hover/item:translate-x-0.5 group-hover/item:opacity-100"
          aria-hidden
        />
      ) : null}
    </>
  );

  if (inactive) {
    return (
      <div
        className={`fifa-repre-menu__item ${ended ? "fifa-repre-menu__item--ended" : "fifa-repre-menu__item--preparing"}`}
        aria-disabled="true"
      >
        {content}
      </div>
    );
  }

  return (
    <Link href={item.href} className="fifa-repre-menu__item group/item" onClick={onNavigate}>
      {content}
    </Link>
  );
}

export function FifaRepreMenuNav({
  items,
  ariaLabel,
  ended = false,
  preparing = false,
  className = "",
  onNavigate,
}: {
  items: FifaHubMenuItem[];
  ariaLabel: string;
  ended?: boolean;
  preparing?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav
      className={`fifa-repre-menu flex w-full max-w-[min(100%,16.5rem)] flex-col gap-2 sm:max-w-[58%] ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <FifaHubMenuItemRow key={item.href} item={item} ended={ended} preparing={preparing} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

export function FifaPreparingHint({
  className = "",
  label = "Připravujeme",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <nav
      className={`fifa-repre-menu flex w-full max-w-[min(100%,16.5rem)] flex-col gap-2 sm:max-w-[58%] ${className}`.trim()}
      aria-label="Stav soutěže"
    >
      <div className="fifa-repre-menu__item fifa-repre-menu__item--preparing" aria-disabled="true">
        <span className="fifa-repre-menu__icon">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block font-display text-sm font-bold leading-tight text-[var(--fifa-text)] lg:text-base">
            {label}
          </span>
        </span>
      </div>
    </nav>
  );
}

type FifaHubMenuCardProps = {
  title: string;
  subtitle?: string;
  art?: ReactNode;
  ended?: boolean;
  preparing?: boolean;
  centerTitle?: boolean;
  className?: string;
  preparingOnlyLabel?: string;
} & (
  | {
      preparingOnly: true;
      menuItems?: never;
      menuAriaLabel?: never;
    }
  | {
      preparingOnly?: false;
      preparingIcon?: never;
      menuItems: FifaHubMenuItem[];
      menuAriaLabel: string;
    }
);

/** Desktop — menu po najetí myší. */
export function FifaHubMenuCard({
  title,
  subtitle,
  art,
  menuItems,
  menuAriaLabel,
  ended = false,
  preparing = false,
  preparingOnly = false,
  preparingOnlyLabel,
  centerTitle = false,
  className = "",
}: FifaHubMenuCardProps) {
  const stateClass = ended
    ? "fifa-hub-menu-card--ended"
    : preparing
      ? "fifa-hub-menu-card--preparing"
      : "";

  return (
    <div
      className={`fifa-card fifa-card-hero fifa-repre-hub-card fifa-hub-menu-card group relative flex min-h-[13rem] flex-col overflow-hidden p-4 sm:min-h-[15rem] max-lg-device:h-auto lg-device:h-full lg-device:min-h-[16.5rem] lg-device:p-5 ${stateClass} ${className}`.trim()}
    >
      {art}
      <div className="fifa-hub-menu-card__focus-scrim pointer-events-none absolute inset-0 z-[6]" aria-hidden />

      <div className="relative z-10 flex min-h-[13rem] flex-1 flex-col gap-3 sm:min-h-[15rem] lg-device:min-h-0 lg-device:gap-3.5">
        {preparingOnly && preparingOnlyLabel ? (
          <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
            <p className="font-display text-lg font-bold text-[var(--fifa-text)] lg:text-xl">{preparingOnlyLabel}</p>
          </div>
        ) : (
          <>
            {centerTitle ? (
              <div className="fifa-repre-hero-headline fifa-repre-hero-headline--top shrink-0 px-2 lg:px-3">
                <FifaRepreHeroHeadline title={title} subtitle={subtitle} />
              </div>
            ) : (
              <div className="max-w-[min(100%,13.5rem)] shrink-0 sm:max-w-[58%]">
                <h2 className="font-display text-xl leading-tight text-[var(--fifa-text)] lg:text-2xl">{title}</h2>
                {subtitle ? (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-[var(--fifa-text-secondary)] lg:text-sm">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            )}

            {preparingOnly ? (
              <FifaPreparingHint />
            ) : (
              <FifaRepreMenuNav
                items={menuItems!}
                ariaLabel={menuAriaLabel!}
                ended={ended}
                preparing={preparing}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
