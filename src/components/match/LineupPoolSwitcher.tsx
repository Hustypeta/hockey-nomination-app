"use client";

import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import {
  allLineupPoolOptions,
  DEFAULT_LINEUP_POOL,
  ELH_CLUBS,
  elhPoolKey,
  isElhPoolKey,
  type LineupPoolOption,
} from "@/lib/lineupPools";

type PoolKind = "repre" | "elh";

type Props = {
  value: string;
  onChange: (poolKey: string) => void;
  counts?: Record<string, number>;
  className?: string;
  /** `compact` = editor pool column; `comfortable` = Moje sestavy / account. */
  size?: "compact" | "comfortable";
};

function optionCount(counts: Record<string, number> | undefined, key: string): number | null {
  const n = counts?.[key];
  return n != null ? n : null;
}

export function LineupPoolSwitcher({
  value,
  onChange,
  counts,
  className,
  size = "compact",
}: Props) {
  const options = allLineupPoolOptions();
  const repre = options.filter((o): o is Extract<LineupPoolOption, { kind: "repre" }> => o.kind === "repre");
  const elh = options.filter((o): o is Extract<LineupPoolOption, { kind: "elh" }> => o.kind === "elh");

  const current = value || DEFAULT_LINEUP_POOL;
  const kind: PoolKind = isElhPoolKey(current) ? "elh" : "repre";
  const lastByKind = useRef<{ repre: string; elh: string }>({
    repre: DEFAULT_LINEUP_POOL,
    elh: elhPoolKey(ELH_CLUBS[0]),
  });

  const selectPool = (poolKey: string) => {
    if (isElhPoolKey(poolKey)) lastByKind.current.elh = poolKey;
    else lastByKind.current.repre = poolKey;
    onChange(poolKey);
  };

  const setKind = (next: PoolKind) => {
    if (next === kind) return;
    if (kind === "repre") lastByKind.current.repre = current;
    else lastByKind.current.elh = current;
    selectPool(next === "repre" ? lastByKind.current.repre : lastByKind.current.elh);
  };

  return (
    <div
      className={`fifa-pool-switcher fifa-pool-switcher--${size} fifa-pool-switcher--${kind}${className ? ` ${className}` : ""}`}
      data-kind={kind}
      role="group"
      aria-label="Pool hráčů sestavy"
    >
      <div className="fifa-pool-switcher__kind" role="tablist" aria-label="Typ poolu">
        <button
          type="button"
          role="tab"
          aria-selected={kind === "repre"}
          className={`fifa-pool-switcher__kind-btn${kind === "repre" ? " fifa-pool-switcher__kind-btn--active" : ""}`}
          onClick={() => setKind("repre")}
        >
          Reprezentace
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={kind === "elh"}
          className={`fifa-pool-switcher__kind-btn${kind === "elh" ? " fifa-pool-switcher__kind-btn--active" : ""}`}
          onClick={() => setKind("elh")}
        >
          Tipsport Extraliga
        </button>
      </div>

      {kind === "repre" ? (
        <div className="fifa-pool-switcher__chips" role="listbox" aria-label="Reprezentační pool">
          {repre.map((o) => {
            const n = optionCount(counts, o.key);
            const active = current === o.key;
            return (
              <button
                key={o.key}
                type="button"
                role="option"
                aria-selected={active}
                className={`fifa-pool-switcher__chip${active ? " fifa-pool-switcher__chip--active" : ""}`}
                onClick={() => selectPool(o.key)}
              >
                <span className="fifa-pool-switcher__chip-label">{o.label}</span>
                {n != null ? <span className="fifa-pool-switcher__chip-count">{n}</span> : null}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="fifa-pool-switcher__select-wrap">
          <select
            className="fifa-pool-switcher__select"
            value={isElhPoolKey(current) ? current : lastByKind.current.elh}
            onChange={(e) => selectPool(e.target.value)}
            aria-label="Klub Extraligy"
          >
            {elh.map((o) => {
              const n = optionCount(counts, o.key);
              return (
                <option key={o.key} value={o.key}>
                  {o.label}
                  {n != null ? ` (${n})` : ""}
                </option>
              );
            })}
          </select>
          <ChevronDown className="fifa-pool-switcher__select-icon" aria-hidden />
        </div>
      )}
    </div>
  );
}
