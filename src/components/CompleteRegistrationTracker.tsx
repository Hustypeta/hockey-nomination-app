"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

const STORAGE_PREFIX = "lineup:metaPixel:completeRegistration:";

export function CompleteRegistrationTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    const userId = session?.user?.id;
    if (!userId) return;
    if (typeof window === "undefined") return;

    const key = `${STORAGE_PREFIX}${userId}`;
    if (window.localStorage.getItem(key) === "1") return;

    // Pixel might not be configured or may still be loading.
    try {
      window.fbq?.("track", "CompleteRegistration");
      window.localStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
  }, [status, session?.user?.id]);

  return null;
}

