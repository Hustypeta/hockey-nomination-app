import { SITE_BRAND } from "@/lib/siteBranding";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-white/40">
      {SITE_BRAND} · Neoficiální fanouškovský nástroj · Česká trikolora inspirována reprezentací
    </footer>
  );
}
