import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

export function FifaHubCard({
  href,
  title,
  description,
  icon: Icon,
  badge,
  compact = false,
  art,
}: {
  href: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  badge?: string;
  compact?: boolean;
  /** Dekorativní pozadí karty (např. fotka). */
  art?: ReactNode;
}) {
  const hero = Boolean(art);

  return (
    <Link
      href={href}
      className={`fifa-card fifa-card--interactive group relative flex h-full min-h-0 flex-col justify-between overflow-hidden ${
        hero ? "fifa-card-hero" : ""
      } ${compact ? "p-4 lg:p-5" : "min-h-[10.5rem] p-5 sm:min-h-[11.5rem] sm:p-6"}`}
    >
      {art}
      <div className={`relative min-h-0 ${hero ? "z-10 max-w-[58%]" : ""}`}>
        {badge ? <span className="fifa-badge">{badge}</span> : null}
        {Icon && !hero ? (
          <Icon className={`text-[var(--fifa-accent-text)] ${compact ? "mt-2 h-6 w-6" : "mt-3 h-8 w-8"}`} aria-hidden />
        ) : null}
        <h2
          className={`font-display leading-tight text-[var(--fifa-text)] ${
            hero ? "drop-shadow-sm" : ""
          } ${
            compact ? "mt-2 text-xl lg:text-2xl" : "mt-3 text-2xl sm:text-[1.65rem]"
          }`}
        >
          {title}
        </h2>
        <p
          className={`mt-1.5 leading-snug ${
            hero ? "text-[rgba(226,236,255,0.82)]" : "text-[var(--fifa-text-secondary)]"
          } ${compact ? "line-clamp-3 text-xs lg:text-sm" : "text-sm"}`}
        >
          {description}
        </p>
      </div>
      <span className={`relative mt-3 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--fifa-accent-text)] lg:text-sm ${hero ? "z-10" : ""}`}>
        Otevřít
        <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
