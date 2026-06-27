import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

export type LeaderboardColumnStatusVariant = "evaluated" | "pending";

type LeaderboardColumnProps = {
  title: string;
  soutezHref: string;
  icon: LucideIcon;
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
  soutezHref,
  icon: Icon,
  status,
  statusVariant = "pending",
  children,
}: LeaderboardColumnProps) {
  return (
    <section className="fifa-card flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="fifa-card-header !items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-[var(--fifa-accent-text)]" aria-hidden />
            <h2 className="truncate font-display text-sm text-[var(--fifa-text)] lg:text-base">{title}</h2>
          </div>
          {status ? (
            <p className={`mt-1 text-[10px] font-medium leading-snug lg:text-[11px] ${STATUS_STYLES[statusVariant]}`}>
              {status}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href={soutezHref} className="fifa-btn-ghost text-[var(--fifa-accent-text)]">
              Soutěž
              <ChevronRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
      <div className="fifa-panel-scroll min-h-0 flex-1 px-2.5 py-2 lg:px-3 lg:py-2.5">{children}</div>
    </section>
  );
}
