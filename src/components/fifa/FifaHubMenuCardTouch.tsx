"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Loader2, type LucideIcon } from "lucide-react";
import { FifaRepreHeroHeadline } from "@/components/fifa/FifaRepreHeroHeadline";

type FifaHubMenuItem = {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
};

type FifaHubMenuCardTouchProps = {
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
      menuItems: FifaHubMenuItem[];
      menuAriaLabel: string;
    }
);

/** Mobil — klepnutí na kartu rozbalí menu (A-tým / U20 / U18). */
export function FifaHubMenuCardTouch({
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
}: FifaHubMenuCardTouchProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const hasMenu = !preparingOnly && Boolean(menuItems?.length);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !cardRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [menuOpen]);

  const stateClass = ended
    ? "fifa-hub-menu-card--ended"
    : preparing
      ? "fifa-hub-menu-card--preparing"
      : "";

  return (
    <div
      ref={cardRef}
      className={`fifa-card fifa-card-hero fifa-repre-hub-card fifa-hub-menu-card fifa-hub-menu-card--touch relative flex min-h-[14rem] w-full flex-col overflow-hidden p-4 sm:min-h-[15rem] max-lg-device:h-auto ${stateClass} ${menuOpen ? "fifa-hub-menu-card--menu-open" : ""} ${className}`.trim()}
    >
      {art}
      {hasMenu ? (
        <button
          type="button"
          className="fifa-hub-menu-card__tap-target"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? `Skrýt menu ${title}` : `Zobrazit menu ${title}`}
          onClick={() => setMenuOpen((open) => !open)}
        />
      ) : null}
      <div className="fifa-hub-menu-card__focus-scrim pointer-events-none absolute inset-0 z-[6]" aria-hidden />

      <div className="fifa-hub-menu-card__content relative z-10 flex min-h-[14rem] flex-1 flex-col gap-3 sm:min-h-[15rem]">
        {preparingOnly && preparingOnlyLabel ? (
          <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
            <p className="font-display text-lg font-bold text-[var(--fifa-text)]">{preparingOnlyLabel}</p>
          </div>
        ) : (
          <>
            {centerTitle ? (
              <div className="fifa-repre-hero-headline fifa-repre-hero-headline--top shrink-0 px-2">
                <FifaRepreHeroHeadline title={title} subtitle={subtitle} />
              </div>
            ) : (
              <div className="max-w-[min(100%,13.5rem)] shrink-0 sm:max-w-[58%]">
                <h2 className="font-display text-xl leading-tight text-[var(--fifa-text)]">{title}</h2>
                {subtitle ? (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-[var(--fifa-text-secondary)]">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            )}

            {preparingOnly ? (
              <nav
                className="fifa-repre-menu flex w-full max-w-[min(100%,16.5rem)] flex-col gap-2 sm:max-w-[58%]"
                aria-label="Stav soutěže"
              >
                <div className="fifa-repre-menu__item fifa-repre-menu__item--preparing" aria-disabled="true">
                  <span className="fifa-repre-menu__icon">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block font-display text-sm font-bold leading-tight text-[var(--fifa-text)]">
                      Připravujeme
                    </span>
                  </span>
                </div>
              </nav>
            ) : (
              <nav
                className="fifa-repre-menu flex w-full max-w-[min(100%,16.5rem)] flex-col gap-2 sm:max-w-[58%]"
                aria-label={menuAriaLabel}
              >
                {menuItems!.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="fifa-repre-menu__item group/item"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="fifa-repre-menu__icon">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block font-display text-sm font-bold leading-tight text-[var(--fifa-text)]">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-[var(--fifa-text-muted)]">
                          {item.hint}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--fifa-accent-text)] opacity-70" aria-hidden />
                    </Link>
                  );
                })}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
