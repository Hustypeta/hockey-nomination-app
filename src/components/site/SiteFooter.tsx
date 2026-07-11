import Link from "next/link";
import { SocialSiteIcons } from "@/components/site/SocialSiteIcons";
import { isFifaDesignEnabled } from "@/lib/fifa/fifaDesignEnabled";

export function SiteFooter() {
  const compact = isFifaDesignEnabled();

  return (
    <footer
      className={
        compact
          ? "fifa-site-footer border-t border-white/[0.06] py-1.5 text-center text-[10px] text-white/40"
          : "border-t border-white/[0.06] py-8 text-center text-xs text-white/40"
      }
    >
      <div>
        <SocialSiteIcons size={compact ? "compact" : "default"} />
      </div>
      <nav
        className={
          compact
            ? "mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[10px] text-white/50"
            : "mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-white/50"
        }
        aria-label="Odkazy v patičce"
      >
        <Link href="/ochrana-udaju" className="underline-offset-4 hover:text-white/75 hover:underline">
          Ochrana osobních údajů
        </Link>
        <span aria-hidden className="text-white/25">
          ·
        </span>
        <Link href="/pravidla-souteze" className="underline-offset-4 hover:text-white/75 hover:underline">
          Pravidla soutěže
        </Link>
      </nav>
    </footer>
  );
}
