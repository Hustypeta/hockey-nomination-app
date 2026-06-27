"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FIFA_SEARCH_INDEX, normalizeSearchText } from "@/lib/fifa/fifaSearchIndex";

type SearchResult = {
  href: string;
  label: string;
  hint?: string;
  icon?: LucideIcon;
};

export function FifaGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<SearchResult[]>(() => {
    const raw = query.trim();
    const q = normalizeSearchText(raw);

    const pages: SearchResult[] = (
      q
        ? FIFA_SEARCH_INDEX.map((entry) => {
            const label = normalizeSearchText(entry.label);
            const kw = (entry.keywords ?? []).map(normalizeSearchText);
            const hint = normalizeSearchText(entry.hint);
            // skóre: shoda od začátku názvu > kdekoliv v názvu > klíčové slovo / sekce
            let score = -1;
            if (label.startsWith(q)) score = 0;
            else if (label.includes(q)) score = 1;
            else if (kw.some((k) => k.includes(q))) score = 2;
            else if (hint.includes(q)) score = 3;
            return { entry, score };
          })
            .filter((r) => r.score >= 0)
            .sort((a, b) => a.score - b.score)
            .map((r) => r.entry)
        : FIFA_SEARCH_INDEX.slice(0, 6)
    ).map((entry) => ({ href: entry.href, label: entry.label, icon: entry.icon, hint: entry.hint }));

    const playerSearch: SearchResult[] = raw
      ? [
          {
            href: `/hraci?q=${encodeURIComponent(raw)}`,
            label: `Hledat hráče „${raw}“`,
            hint: "Hráči",
            icon: Users,
          },
        ]
      : [];

    return [...pages.slice(0, 8), ...playerSearch];
  }, [query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const go = useCallback(
    (target?: SearchResult) => {
      const dest = target ?? results[active] ?? results[0];
      if (!dest) return;
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
      router.push(dest.href);
    },
    [results, active, router],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go();
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={wrapRef} className="relative mx-auto hidden min-w-0 max-w-xs flex-1 md:block lg:max-w-sm">
      <div className="flex items-center gap-2 rounded-[var(--fifa-radius-md)] border border-[var(--fifa-border)] bg-[var(--fifa-bg-elevated)] px-3 py-2 text-xs text-[var(--fifa-text-muted)] focus-within:border-[var(--fifa-border-strong)]">
        <Search className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Hledat…"
          aria-label="Hledat na webu"
          className="w-full bg-transparent text-[var(--fifa-text)] outline-none placeholder:text-[var(--fifa-text-muted)]"
        />
      </div>

      {open && results.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 overflow-hidden rounded-[var(--fifa-radius-md)] border border-[var(--fifa-border)] bg-[var(--fifa-bg-chrome)] shadow-xl">
          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {results.map((r, i) => {
              const Icon = r.icon ?? Search;
              return (
                <li key={`${r.href}-${r.label}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                      i === active
                        ? "bg-[var(--fifa-bg-hover)] text-[var(--fifa-text)]"
                        : "text-[var(--fifa-text-secondary)]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                    <span className="flex-1 truncate">{r.label}</span>
                    {r.hint ? (
                      <span className="shrink-0 text-[10px] uppercase tracking-wide text-[var(--fifa-text-muted)]">
                        {r.hint}
                      </span>
                    ) : null}
                    {i === active ? <CornerDownLeft className="h-3 w-3 shrink-0 opacity-50" aria-hidden /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
