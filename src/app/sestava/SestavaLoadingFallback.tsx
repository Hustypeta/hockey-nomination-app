"use client";

import { useSession } from "next-auth/react";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";

/** Fallback pro Suspense — stejná logika CTA jako při načítání hráčů v editoru. */
export function SestavaLoadingFallback() {
  const { status } = useSession();
  return (
    <AppLoadingScreen message="Načítám editor…" showSignInCta={status !== "authenticated"} />
  );
}
