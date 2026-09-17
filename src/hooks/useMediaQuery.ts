"use client";

import { useSyncExternalStore } from "react";

/**
 * Zoom-stable narrow layout (≈ Tailwind `max-lg` / 1023px).
 * Requires both viewport CSS width AND device width below the breakpoint so
 * browser zoom on a desktop monitor does not flip the app into mobile chrome.
 * Resizing a desktop window small keeps desktop layout (device-width stays wide);
 * real phones still match.
 */
export const MQ_LAYOUT_NARROW =
  "(max-width: 1023px) and (max-device-width: 1023px)";

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

/** Layout shell: mobile structure only on real narrow devices, not desktop zoom. */
export function useNarrowLayout(): boolean {
  return useMediaQuery(MQ_LAYOUT_NARROW);
}
