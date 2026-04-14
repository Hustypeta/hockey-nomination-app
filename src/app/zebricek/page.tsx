import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { SitePageHero } from "@/components/site/SitePageHero";
import { CONTEST_DEADLINE_CS } from "@/lib/contestTimeBonus";

export const metadata: Metadata = {
  title: "Žebříček",
  description: "Žebříček nominací a Pick’em MS 2026 — plánované vyhodnocení.",
};

export default function LeaderboardHubPage() {
  return (
    <SiteShell>
      <SitePageHero
        kicker="Výsledky"
        title="Žebříček"
        subtitle="Přehled bodů ze sestavovací soutěže a Pick’em — doplníme po vyhodnocení."
        align="center"
      />
      <main className="relative z-10 mx-auto max-w-2xl px-4 pb-24 pt-2 sm:px-6">
        <div className="sestava-premium-panel-dark rounded-2xl border border-white/[0.08] p-6 text-sm leading-relaxed text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8">
          <p className="font-display text-base font-semibold text-white">Plánované vyhodnocení</p>
          <ul className="mt-5 list-inside list-disc space-y-4 marker:text-[#f1c40f]/80">
            <li>
              <strong className="text-white/95">Sestavovací soutěž (nominace):</strong> žebříček zveřejníme po uzávěrce
              odeslání nominací ({CONTEST_DEADLINE_CS}) a po zpracování oficiální soupisky a zápisu z prvního zápasu ČR na
              MS — obvykle v průběhu nebo těsně po šampionátu, podle dostupnosti dat.
            </li>
            <li>
              <strong className="text-white/95">Pick’em (play-off):</strong> vyhodnocení tipů a žebříček doplníme po
              skončení play-off MS 2026 (termín upřesníme podle kalendáře turnaje).
            </li>
          </ul>
          <p className="mt-6 border-t border-white/[0.08] pt-5 text-xs text-white/50">
            Aktuální náhled soutěže nominací najdeš na stránce{" "}
            <a href="/contest/leaderboard" className="font-medium text-sky-300/95 underline-offset-2 hover:underline">
              Žebříček nominací
            </a>{" "}
            (po zveřejnění oficiální soupisky v administraci).
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
