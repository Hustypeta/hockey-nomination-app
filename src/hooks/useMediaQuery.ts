"use client";

import { useSyncExternalStore } from "react";

/**
 * Sleduje `window.matchMedia` — pro rozvržení editoru (např. max-lg).
 * getServerSnapshot vždy vrací false (desktop), aby SSR a první klientský render seděly.
 * Po hydrataci se hodnota aktualizuje podle skutečné šířky viewportu.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
