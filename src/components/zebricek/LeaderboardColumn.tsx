import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type LeaderboardColumnStatusVariant = "evaluated" | "pending";
export type LeaderboardPaneId = "nominace" | "fantasy";

type LeaderboardColumnProps = {
  title: string;
  icon: LucideIcon;
  pane: LeaderboardPaneId;
  status?: string;
  statusVariant?: LeaderboardColumnStatusVariant;
  children: ReactNode;
};

const STATUS_STYLES: Record<LeaderboardColumnStatusVariant, string> = {
  evaluated: "text-emerald-400/90",
  pending: "text-amber-300/90",
};

export function LeaderboardColumn({
  title,
  icon: Icon,
  pane,
  status,
  statusVariant = "pending",
  children,
}: LeaderboardColumnProps) {
  return (
    <section
      className={`fifa-card fifa-zebricek-pane fifa-zebricek-pane--${pane} flex h-full min-h-0 min-w-0 flex-col overflow-hidden`}
    >
      <div className="fifa-card-header !items-start">
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fifa-accent-text)]" aria-hidden />
            <h2 className="font-display text-sm leading-snug text-[var(--fifa-text)] lg:text-base">{title}</h2>
          </div>
          {status ? (
            <p className={`mt-1 text-[10px] font-medium leading-snug lg:text-[11px] ${STATUS_STYLES[statusVariant]}`}>
              {status}
            </p>
          ) : null}
        </div>
      </div>
      <div className="fifa-panel-scroll min-h-0 flex-1 px-2.5 py-2 lg:px-3 lg:py-2.5">{children}</div>
    </section>
  );
}
