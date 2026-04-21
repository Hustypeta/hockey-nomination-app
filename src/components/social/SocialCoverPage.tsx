"use client";

import { useEffect } from "react";
import { SocialCoverCanvas } from "@/components/social/SocialCoverCanvas";

const COVER_CLASS = "social-cover";

/**
 * Celá obrazovka pro snímek obrazovky — bez SiteHeader / patičky / toast interakce.
 * Aktivace: `/?cover=true` nebo `/cover`.
 */
export function SocialCoverPage() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(COVER_CLASS);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      root.classList.remove(COVER_CLASS);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div className="social-cover-root min-h-screen bg-[#020408]">
      <div className="flex min-h-screen items-center justify-center px-3 py-6 sm:px-6 sm:py-10">
        <div className="social-cover-scale-wrapper w-full max-w-[calc(100vw-1.5rem)] overflow-x-auto">
          <SocialCoverCanvas />
        </div>
      </div>
      <p className="sr-only">
        Cover režim pro snímek obrazovky. Zavři záložku nebo odstraň parametr cover z URL pro normální web.
      </p>
    </div>
  );
}
