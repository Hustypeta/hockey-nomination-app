"use client";

import Link from "next/link";
import { SITE_LOGO_URL } from "@/lib/siteBranding";
import { FifaAccountAvatar } from "@/components/fifa/FifaAccountAvatar";
import { FifaGlobalSearch } from "@/components/fifa/FifaGlobalSearch";
import { FifaNotificationsBell } from "@/components/fifa/FifaNotificationsBell";
import { FifaTopNav } from "@/components/fifa/FifaTopNav";
import { SocialSiteIcons } from "@/components/site/SocialSiteIcons";

export function FifaAppShell({ children, designPreview = false }: { children: React.ReactNode; designPreview?: boolean }) {
  return (
    <div className="fifa-app-chrome flex min-h-0 flex-1 flex-col overflow-hidden">
      {designPreview ? (
        <p className="shrink-0 border-b border-[var(--fifa-border)] bg-[var(--fifa-bg-chrome)] px-3 py-1.5 text-center text-[10px] font-medium text-[var(--fifa-text-muted)] lg:text-xs">
          Design náhled ·{" "}
          <Link href="/" className="text-[var(--fifa-accent-text)] underline-offset-2 hover:underline">
            ← produkční úvod
          </Link>
        </p>
      ) : null}
      <header className="z-50 shrink-0 border-b border-[var(--fifa-border)] bg-[var(--fifa-bg-chrome)]">
        <div className="fifa-header-bar flex items-center gap-3 px-4 py-1.5 lg:px-5">
          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              href={designPreview ? "/design/home" : "/"}
              className="fifa-header-logo relative flex h-9 w-28 shrink-0 items-center justify-center overflow-hidden lg:h-10 lg:w-36"
              aria-label="Hokej Lineup"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SITE_LOGO_URL} alt="Hokej Lineup" width={1024} height={683} />
            </Link>
            <SocialSiteIcons size="compact" />
          </div>
          <FifaGlobalSearch />
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <FifaNotificationsBell />
            <FifaAccountAvatar />
          </div>
        </div>
        <FifaTopNav designPreview={designPreview} />
      </header>
      <div className="fifa-app-content flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain lg:overflow-hidden">
        {children}
      </div>
    </div>
  );
}
