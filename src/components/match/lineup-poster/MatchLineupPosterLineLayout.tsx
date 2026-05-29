"use client";

import type { ReactNode } from "react";
import type { MatchLineupLineExtraSlot } from "@/lib/matchLineupPosterSegments";
import styles from "./MatchLineupPosterLineLayout.module.css";

export type MatchLineupPosterLineLayoutProps = {
  forwards: ReactNode[];
  defense: ReactNode[];
  /** Jeden gólman ve spodní řadě hlavního gridu (typicky 1. gólman na 1. lajně). */
  goalie: ReactNode | null;
  extraSlots?: MatchLineupLineExtraSlot[];
  renderExtraCard: (slot: MatchLineupLineExtraSlot) => ReactNode;
  variant?: "dark" | "light";
  compact?: boolean;
  className?: string;
};

export function MainLineupGrid({
  forwards,
  defense,
  goalie,
  variant = "dark",
  compact = false,
}: Pick<MatchLineupPosterLineLayoutProps, "forwards" | "defense" | "goalie" | "variant" | "compact">) {
  const rootClass = [styles.mainGrid, variant === "light" ? styles.light : "", compact ? styles.compact : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      {forwards.length > 0 ? (
        <div className={styles.rowForwards}>
          {forwards.map((node, i) => (
            <div key={`f-${i}`} className={styles.cell}>
              {node}
            </div>
          ))}
        </div>
      ) : null}

      {defense.length > 0 ? (
        <div className={styles.rowDefense}>
          {defense.map((node, i) => (
            <div key={`d-${i}`} className={styles.cell}>
              {node}
            </div>
          ))}
        </div>
      ) : null}

      {goalie ? (
        <div className={styles.rowGoalie}>
          <div className={styles.goalieCell}>{goalie}</div>
        </div>
      ) : null}
    </div>
  );
}

export function ExtraPlayerLabel({ children }: { children: string }) {
  return <span className={styles.extraLabel}>{children}</span>;
}

export function ExtraPlayerSlotBand({
  extraSlots,
  renderExtraCard,
  variant = "dark",
  compact = false,
}: Pick<MatchLineupPosterLineLayoutProps, "extraSlots" | "renderExtraCard" | "variant" | "compact">) {
  if (!extraSlots?.length) return null;

  const bandClass = [
    styles.extraBand,
    variant === "light" ? styles.light : "",
    compact ? styles.compact : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={bandClass} data-lineup-extra-band>
      <div className={styles.extraRow}>
        {extraSlots.map((slot) => (
          <div key={`${slot.kind}-${slot.playerId}`} className={styles.extraSlot}>
            <ExtraPlayerLabel>{slot.label}</ExtraPlayerLabel>
            <div className={styles.extraCard}>{renderExtraCard(slot)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Hlavní 3F+2D+G grid + volitelný secondary band pro extra hráče. */
export function MatchLineupPosterLineLayout({
  forwards,
  defense,
  goalie,
  extraSlots,
  renderExtraCard,
  variant = "dark",
  compact = false,
  className = "",
}: MatchLineupPosterLineLayoutProps) {
  const stackClass = [styles.stack, className].filter(Boolean).join(" ");

  return (
    <div className={stackClass}>
      <MainLineupGrid
        forwards={forwards}
        defense={defense}
        goalie={goalie}
        variant={variant}
        compact={compact}
      />
      <ExtraPlayerSlotBand
        extraSlots={extraSlots}
        renderExtraCard={renderExtraCard}
        variant={variant}
        compact={compact}
      />
    </div>
  );
}
