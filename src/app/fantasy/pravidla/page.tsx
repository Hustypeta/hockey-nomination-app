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
  MS_FANTASY_TIER_SALARY,
} from "@/lib/msFantasyConfig";

export const metadata: Metadata = {
  title: "Pravidla a body — Fantasy MS",
  description:
    "Salary cap, sestava 6 hráčů, platové tiery a fantasy body za zápas — MS 2026 na hokejlineup.cz.",
  alternates: { canonical: "/fantasy/pravidla" },
  openGraph: {
    title: "Pravidla a body — Fantasy MS",
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
    title: "Pravidla a body — Fantasy MS",
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
          Pravidla a body
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
          Níže jsou limity a bodování tak, jak je aplikace používá. Čísla se berou přímo z konfigurace serveru — po
          případné úpravě capu nebo bodů se na této stránce projeví automaticky.
        </p>

        <section className="mt-10 space-y-4">
          <h2 className="font-display text-lg font-bold text-white">Sestava na hrací den</h2>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-300">
            <li>
              Přesně <strong className="text-slate-100">{MS_FANTASY_TEAM_SIZE} hráčů</strong>, každý nejvýš jednou.
            </li>
            <li>
              Přesně <strong className="text-slate-100">jeden brankář</strong> (pozice G), ostatní jsou útočníci nebo
              obránci (F / D).
            </li>
            <li>
              Součet platů podle tieru nesmí překročit{" "}
              <strong className="text-slate-100">{MS_FANTASY_CAP} kreditů</strong> (salary cap).
            </li>
            <li>
              Po času uzávěrky dne už sestavu nelze uložit — platí čas uvedený u konkrétního hracího dne.
            </li>
            <li>Do sestavy jdou jen hráči z aktivního poolu (ne deaktivovaní).</li>
          </ul>

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
                    <td className="px-4 py-2.5 tabular-nums">{MS_FANTASY_TIER_SALARY[t] ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            U některých reprezentací může být v datech jen část tierů (např. Itálie, Dánsko a Slovinsko mají v poolu
            tiery C až E). Švýcarsko má v datech i nejvyšší tier A u vybraných hvězd.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-display text-lg font-bold text-white">Bodování za zápas</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Tabulka je smlouva pro výpočet fantasy bodů u jednoho zápasu — konstanty a funkce jsou v kódu připravené.
            Samotné dopočítání bodů za den z reálných statistik MS a veřejný fantasy žebříček jsou další vrstva nad
            uloženými sestavami.
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
                  <td className="px-4 py-2.5">Plus/mínus (za každý bod +/-)</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-emerald-200/95">+{sk.plusMinus}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">Střely a hity v pravidlech zatím nejsou.</p>

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
                  <td className="px-4 py-2.5">Shutout</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-emerald-200/95">+{gk.shutout}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 sm:px-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
            Co je v produktu hotové
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Celá smyčka fantasy kolem sestav — rozhraní, API i databáze — je funkční: hráč vidí dny, vybere šestici,
            systém ověří pravidla a uloží řádek do databáze. Pool hráčů a hrací dny jdou naplnit seedem z JSON
            soupisek.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-300">
            <li>Stránky `/fantasy` a editor dne včetně uzávěrky podle času dne</li>
            <li>API `/api/fantasy/game-days`, `roster`, `my-lineup` (GET/POST s lockem a validací)</li>
            <li>Modely `MsFantasyGameDay`, `MsFantasyRosterPlayer`, `MsFantasyLineup` a uložení `pickIds` / `salarySpent`</li>
            <li>Stránka pravidel, kterou právě čteš</li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Nad rámec toho zatím typicky zbývá napojit živé výsledky MS na výpočet bodů podle tabulek výše a případně
            zobrazit souhrnný žebříček — samotná pravidla výpočtu už v repozitáři jsou.
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
