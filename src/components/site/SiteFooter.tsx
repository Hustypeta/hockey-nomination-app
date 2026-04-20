import Link from "next/link";
import { SITE_BRAND } from "@/lib/siteBranding";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-white/40">
      <p>
        {SITE_BRAND} · Neoficiální fanouškovský nástroj · Česká trikolora inspirována reprezentací
      </p>
      <nav
        className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-white/50"
        aria-label="Právní informace"
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
