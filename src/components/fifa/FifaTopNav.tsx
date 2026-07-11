"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { buildFifaAppNav, isFifaNavItemActive, type FifaAppNavItem } from "@/lib/fifa/fifaAppNav";

function FifaNavLink({
  item,
  active,
  variant,
  onNavigate,
  tabIndex,
}: {
  item: FifaAppNavItem;
  active: boolean;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
  tabIndex?: number;
}) {
  const { href, label, icon: Icon } = item;
  const className =
    variant === "desktop"
      ? `fifa-nav-link snap-center lg:px-2 ${active ? "fifa-nav-link--active" : ""}`
      : `fifa-nav-link fifa-nav-link--mobile ${active ? "fifa-nav-link--active" : ""}`;

  return (
    <Link href={href} onClick={onNavigate} className={className} tabIndex={tabIndex}>
      <span className="flex min-w-0 items-center gap-2">
        <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "opacity-90"}`} aria-hidden />
        <span className={variant === "desktop" ? "whitespace-nowrap" : "truncate"}>{label}</span>
      </span>
      {variant === "desktop" ? <span className="fifa-nav-link__indicator" aria-hidden /> : null}
    </Link>
  );
}

export function FifaTopNav({ designPreview = false }: { designPreview?: boolean }) {
  const pathname = usePathname();
  const navItems = buildFifaAppNav(designPreview);
  const panelId = "fifa-top-nav-mobile-panel";
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = navItems.find((item) => isFifaNavItemActive(pathname, item)) ?? navItems[0]!;
  const ActiveIcon = activeItem.icon;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Blur any focused element inside the panel before it becomes aria-hidden
  useEffect(() => {
    if (!mobileOpen && panelRef.current) {
      const focused = panelRef.current.querySelector<HTMLElement>(":focus");
      if (focused) focused.blur();
      toggleRef.current?.focus({ preventScroll: true });
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen || !toggleRef.current || !panelRef.current) return;
    const syncTop = () => {
      const rect = toggleRef.current!.getBoundingClientRect();
      panelRef.current!.style.setProperty("--fifa-mobile-nav-top", `${rect.bottom + 6}px`);
    };
    syncTop();
    window.addEventListener("resize", syncTop);
    window.addEventListener("scroll", syncTop, true);
    return () => {
      window.removeEventListener("resize", syncTop);
      window.removeEventListener("scroll", syncTop, true);
    };
  }, [mobileOpen]);

  return (
    <>
      <div
        className={`fifa-top-nav-mobile-backdrop lg:hidden ${mobileOpen ? "fifa-top-nav-mobile-backdrop--open" : ""}`}
        aria-hidden
        onClick={() => setMobileOpen(false)}
      />

    <div ref={rootRef} className={`fifa-top-nav-root relative shrink-0 border-t border-[var(--fifa-border)] bg-[var(--fifa-bg-chrome)] ${mobileOpen ? "fifa-top-nav-root--open" : ""}`}>
      <div className="fifa-top-nav-mobile lg:hidden">
        <button
          ref={toggleRef}
          type="button"
          className="fifa-top-nav-mobile__toggle"
          aria-expanded={mobileOpen}
          aria-controls={panelId}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <ActiveIcon className="h-4 w-4 shrink-0 text-[var(--fifa-accent-text)]" aria-hidden />
            <span className="truncate text-left font-semibold text-[var(--fifa-text)]">{activeItem.label}</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[var(--fifa-text-secondary)] transition-transform duration-200 ${
              mobileOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>

        <div
          ref={panelRef}
          id={panelId}
          className={`fifa-top-nav-mobile__panel ${mobileOpen ? "fifa-top-nav-mobile__panel--open" : ""}`}
          aria-hidden={!mobileOpen}
          hidden={!mobileOpen}
        >
          <nav className="fifa-top-nav-mobile__list" aria-label="Hlavní menu">
            {navItems.map((item) => (
              <FifaNavLink
                key={item.href}
                item={item}
                active={isFifaNavItemActive(pathname, item)}
                variant="mobile"
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </nav>
        </div>
      </div>

      <nav
        className="fifa-top-nav-scroll hidden w-full items-stretch gap-0 px-5 lg:flex"
        aria-label="Hlavní menu"
      >
        {navItems.map((item) => (
          <FifaNavLink
            key={item.href}
            item={item}
            active={isFifaNavItemActive(pathname, item)}
            variant="desktop"
          />
        ))}
      </nav>
    </div>
    </>
  );
}
