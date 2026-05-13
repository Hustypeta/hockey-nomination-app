import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/SiteShell";
import {
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
} from "@/lib/siteBranding";
import {
  isMsFantasyVisibleToUsers,
  MS_FANTASY_CAP,
  MS_FANTASY_POINTS,
  MS_FANTASY_TEAM_SIZE,
  MS_FANTASY_TIER_SALARY_GOALIE,
  MS_FANTASY_TIER_SALARY_SKATER,
} from "@/lib/msFantasyConfig";

export const metadata: Metadata = {
  title: "Pravidla a bodování — Fantasy MS",
  description:
    "Salary cap, sestava 6 hráčů, platové tiery a fantasy body za zápas — MS 2026 na hokejlineup.cz.",
  alternates: { canonical: "/fantasy/pravidla" },
  openGraph: {
    title: "Pravidla a bodování — Fantasy MS",
    description:
      "Salary cap, sestava 6 hráčů, platové tiery a fantasy body za zápas — MS 2026 na hokejlineup.cz.",
    url: "/fantasy/pravidla",
    type: "website",
    locale: "cs_CZ",
    images: [
      {
        url: SITE_OG_DEFAULT_IMAGE_URL,
        width: SITE_OG_DEFAULT_IMAGE_WIDTH,
        height: SITE_OG_DEFAULT_IMAGE_HEIGHT,
        alt: "Lineup · hokejlineup.cz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pravidla a bodování — Fantasy MS",
    description:
      "Salary cap, sestava 6 hráčů, platové tiery a fantasy body za zápas — MS 2026 na hokejlineup.cz.",
    images: [SITE_OG_DEFAULT_IMAGE_URL],
  },
};

const tierOrder = ["A", "B", "C", "D", "E"] as const;

export default function FantasyRulesPage() {
  if (!isMsFantasyVisibleToUsers()) notFound();

  const sk = MS_FANTASY_POINTS.skater;
  const gk = MS_FANTASY_POINTS.goalie;

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Link
          href="/fantasy"
          className="text-xs font-semibold text-[#00B4FF] hover:underline"
        >
          ← Fantasy přehled
        </Link>
        <p className="mt-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-[#00B4FF]/90">
          MS 2026
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Pravidla a bodování
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
          Níže najdeš limity a bodování tak, jak je aplikace používá. Data se propisují přímo z konfigurace serveru – po
          případné úpravě platového stropu nebo bodů se změny na této stránce projeví automaticky.
        </p>

        <section className="mt-10 space-y-4">
          <h2 className="font-display text-lg font-bold text-white">Sestava na hrací den</h2>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-300">
            <li>
              <strong className="text-slate-200">Počet hráčů:</strong> Přesně{" "}
              <strong className="text-slate-100">{MS_FANTASY_TEAM_SIZE} hráčů</strong>, každý může být v týmu pouze
              jednou.
            </li>
            <li>
              <strong className="text-slate-200">Složení:</strong> Přesně jeden brankář (G), zbytek tvoří útočníci
              nebo obránci (F / D).
            </li>
            <li>
              <strong className="text-slate-200">Salary cap:</strong> Celkový součet platů nesmí překročit{" "}
              <strong className="text-slate-100">{MS_FANTASY_CAP} kreditů</strong>. Platy se odvíjejí od tieru a pozice
              hráče.
            </li>
            <li>
              <strong className="text-slate-200">Uzávěrka:</strong> Po čase uzávěrky dne už sestavu nelze měnit ani
              uložit – rozhodující je čas uvedený u konkrétního hracího dne.
            </li>
            <li>
              <strong className="text-slate-200">Výběr hráčů:</strong> Do sestavy lze vybrat pouze hráče z aktivního
              poolu.
            </li>
          </ul>

          <h2 className="mt-8 font-display text-lg font-bold text-white">Platy hráčů podle tierů</h2>

          <h3 className="mt-1 text-sm font-semibold text-slate-200">Bruslaři (F / D)</h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04]">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Plat (kredity)</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {tierOrder.map((t) => (
                  <tr key={t} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-4 py-2.5 font-mono font-medium">{t}</td>
                    <td className="px-4 py-2.5 tabular-nums">{MS_FANTASY_TIER_SALARY_SKATER[t] ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-sm font-semibold text-slate-200">Brankáři (G)</h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04]">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Plat (kredity)</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {tierOrder.map((t) => (
                  <tr key={`g-${t}`} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-4 py-2.5 font-mono font-medium">{t}</td>
                    <td className="px-4 py-2.5 tabular-nums">{MS_FANTASY_TIER_SALARY_GOALIE[t] ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            <strong className="font-semibold text-slate-400">Poznámka:</strong> U některých reprezentací může být v
            datech dostupná jen část tierů (např. Itálie, Dánsko a Slovinsko mají v poolu tiery C až E). Vybrané hvězdy
            (např. Švýcarsko) mohou mít k dispozici i nejvyšší tier A.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-display text-lg font-bold text-white">Bodování za zápas</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Body se počítají na základě reálných statistik z utkání Mistrovství světa. Výsledný fantasy žebříček se
            aktualizuje po skončení hracího dne.
          </p>

          <h3 className="text-sm font-semibold text-slate-200">Bruslař (útočník nebo obránce)</h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04]">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Statistika</th>
                  <th className="px-4 py-3">Body</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-2.5">Gól</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-emerald-200/95">+{sk.goal}</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-2.5">Asistence</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-emerald-200/95">+{sk.assist}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">Plus/mínus</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-emerald-200/95">±{sk.plusMinus}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            U plus/mínus platí <strong className="text-slate-400">+{sk.plusMinus} bod</strong> za každý kladný bod v
            reálné statistice a naopak (záporný krok v +/- odečítá stejně mnoho bodů).
          </p>
          <p className="text-xs leading-relaxed text-slate-500">
            Střely a hity se v této fázi do pravidel nezapočítávají.
          </p>

          <h3 className="pt-2 text-sm font-semibold text-slate-200">Brankář</h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04]">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Statistika</th>
                  <th className="px-4 py-3">Body</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-2.5">Výhra</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-emerald-200/95">+{gk.win}</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-2.5">Inkasovaný gól</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-amber-200/90">{gk.goalAgainst}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">Čisté konto (shutout)</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-emerald-200/95">+{gk.shutout}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
