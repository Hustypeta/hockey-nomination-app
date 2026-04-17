"use client";

import { useSyncExternalStore } from "react";

/**
 * Sleduje `window.matchMedia` — pro rozvržení editoru (např. max-lg).
 * Na serveru vrací `false` (getServerSnapshot).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false),
    () => false
  );
}
