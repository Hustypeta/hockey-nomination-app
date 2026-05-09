"use client";

import { useCallback, useMemo, useState } from "react";

interface UndoableState<T> {
  past: T[];
  present: T;
  future: T[];
}

/**
 * Stavový hook s historií (undo/redo). Past/future stack je omezený, aby v paměti
 * neuvízly tisíce sestav při dlouhém editování.
 */
export function useUndoableState<T>(initial: T, opts?: { limit?: number }) {
  const limit = opts?.limit ?? 50;
  const [history, setHistory] = useState<UndoableState<T>>({
    past: [],
    present: initial,
    future: [],
  });

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setHistory((h) => {
        const computed =
          typeof next === "function"
            ? (next as (p: T) => T)(h.present)
            : next;
        if (Object.is(computed, h.present)) return h;
        const past = [...h.past, h.present];
        if (past.length > limit) past.shift();
        return { past, present: computed, future: [] };
      });
    },
    [limit]
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1]!;
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const [next, ...rest] = h.future;
      return {
        past: [...h.past, h.present],
        present: next!,
        future: rest,
      };
    });
  }, []);

  /** Tvrdé nahrazení bez záznamu do historie (např. při načtení výchozího stavu). */
  const replace = useCallback((next: T) => {
    setHistory({ past: [], present: next, future: [] });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const api = useMemo(
    () => ({ state: history.present, set, undo, redo, replace, canUndo, canRedo }),
    [history.present, set, undo, redo, replace, canUndo, canRedo]
  );

  return api;
}
