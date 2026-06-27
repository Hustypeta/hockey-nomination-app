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

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !rootRef.current?.contains(target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile backdrop scrim — outside rootRef so clicking it counts as "outside" */}
      <div
        className="fixed inset-0 z-[49] lg:hidden"
        style={{
          background: "rgba(0,0,0,0.55)",
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
        aria-hidden
        onClick={() => setMobileOpen(false)}
      />

    <div ref={rootRef} className="relative z-[50] shrink-0 border-t border-[var(--fifa-border)] bg-[var(--fifa-bg-chrome)]">
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
          inert={!mobileOpen ? true : undefined}
        >
          <nav className="fifa-top-nav-mobile__list" aria-label="Hlavní menu">
            {navItems.map((item) => (
              <FifaNavLink
                key={item.href}
                item={item}
                active={isFifaNavItemActive(pathname, item)}
                variant="mobile"
                onNavigate={() => setMobileOpen(false)}
                tabIndex={mobileOpen ? undefined : -1}
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
