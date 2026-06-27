"use client";

import { useSyncExternalStore } from "react";

function getMediaQuerySnapshot(query: string): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}

/**
 * Sleduje `window.matchMedia` — pro rozvržení editoru (např. max-lg).
 * getServerSnapshot na klientu čte skutečný viewport (kvůli hydrataci na mobilu).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => getMediaQuerySnapshot(query),
    () => getMediaQuerySnapshot(query)
  );
}
