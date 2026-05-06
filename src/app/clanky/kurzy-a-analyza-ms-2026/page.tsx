import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Kurzy a analýza: Kdo ovládne MS v hokeji 2026?",
  description:
    "Kurzy a analýza MS 2026 — srovnání kurzů na vítěze a rozbor hlavních favoritů.",
  alternates: { canonical: "/clanky/kurzy-a-analyza-ms-2026" },
  openGraph: { url: "/clanky/kurzy-a-analyza-ms-2026" },
};

const TABLE = [
  { team: "Kanada", odds: "2,60 – 3,00", position: "Hlavní favorit" },
  { team: "USA", odds: "4,50 – 5,50", position: "Obhájce titulu" },
  { team: "Švédsko", odds: "5,00 – 6,00", position: "Tradiční aspirant" },
  { team: "Švýcarsko", odds: "5,50 – 7,00", position: "Domácí favorit" },
  { team: "Finsko", odds: "6,50 – 8,00", position: "Systémový tým" },
  { team: "Česko", odds: "7,50 – 9,00", position: "Širší okruh favoritů" },
];

export default function ArticleOddsAnalysisPage() {
  return (
    <main className="min-h-screen bg-[#05080f] text-white">
      <div className="sticky top-0 z-40">
        <SiteHeader />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">
            Článek
          </p>
          <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">
            Kurzy a analýza: Kdo ovládne MS v hokeji 2026?
          </h1>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-white/80 sm:text-base">
            <p>
              Hokejový šampionát ve Švýcarsku startuje 15. května 2026. Pohled na sázkové kurzy i vyjádření expertů naznačují jasné favority, turnajová historie však pravidelně ukazuje, že o výsledku rozhodují detaily v klíčových momentech. Následující přehled vychází z průměrných hodnot českých i zahraničních sázkových kanceláří k 6. květnu.
            </p>

            <h2 className="pt-3 font-display text-2xl font-black text-white sm:text-3xl">
              Srovnání kurzů na celkového vítěze MS 2026
            </h2>
            <p className="text-white/70">(Průměrné hodnoty k 6. 5. 2026)</p>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="sticky top-0 bg-[#0b1220] text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
                    <tr>
                      <th className="px-4 py-3">Tým</th>
                      <th className="px-4 py-3">Kurz na vítězství</th>
                      <th className="px-4 py-3">Pozice v turnaji</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {TABLE.map((r, idx) => (
                      <tr
                        key={r.team}
                        className={`${idx % 2 === 0 ? "bg-white/[0.02]" : ""} hover:bg-white/[0.04]`}
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-bold text-white">{r.team}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-white/90">{r.odds}</td>
                        <td className="min-w-[14rem] px-4 py-3 text-white/75">{r.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <h2 className="pt-3 font-display text-2xl font-black text-white sm:text-3xl">
              Analýza hlavních favoritů
            </h2>

            <p>
              1. Kanada: Ofenzivní síla a hloubka kádruKanada potvrzuje roli tradičního hegemona. Letošní výběr těží z kombinace nastupujících hvězd a zkušených veteránů. Účast potvrdili hráči jako Macklin Celebrini, Gavin McKenna, Mark Scheifele či Mathew Barzal, v obraně pak vyčnívá Morgan Rielly. Přítomnost lídrů jako Tavares či O’Reilly dodává týmu potřebný klid. Pokud se kanadskému výběru podaří stabilizovat brankoviště, bude díky své ofenzivní hloubce jen těžko k zastavení.
            </p>
            <p>
              2. USA: Dynamika a obhajoba zlataAmerický výběr obhajuje loňské prvenství a i letos sází na agresivní forčeking a vynikající bruslení. Kádr složený výhradně z hráčů NHL je v pohybu dominantní a dokáže soupeře dostat pod extrémní tlak. USA zůstávají jedním z nejvážnějších kandidátů na finálovou účast.
            </p>
            <p>
              3. Švýcarsko: Ambice podpořené domácím ledemDomácí prostředí v Curychu a Fribourgu bude pro švýcarský tým zásadním faktorem. Švýcaři se v posledních letech etablovali mezi světovou špičku a pravidelná účast v semifinále to jen potvrzuje. Díky silné generaci hráčů a bouřlivé podpoře v zádech jsou považováni za nejsilnějšího „černého koně“ turnaje.
            </p>
            <p>
              4. Česko: Hledání rovnováhy pod tlakem omluvenekČeský hokej sice prochází úspěšným obdobím, nominaci pro letošní šampionát však komplikuje situace v zámoří. Absence klíčových postav (negativní postoj Davida Pastrňáka, komunikační bariéra u Pavla Zachy či zdravotní omluvy Filipa Zadiny a Matěje Stránského) oslabují papírovou sílu útoku. Tým se bude muset opřít o defenzivní lídry v čele s Filipem Hronkem, důraz Adama Klapky a formu brankářů. Kurz 7,50–9,00 odráží rizika spojená s oslabenou sestavou, ale stále nabízí zajímavou hodnotu pro sázky na umístění do medailových pozic.
            </p>
            <p>
              5. Švédsko a FinskoOba severští soupeři sázejí na odlišné zbraně. Švédsko disponuje vyváženou sestavou s vynikající organizací hry, zatímco Finsko tradičně sází na propracovaný systém a schopnost ničit ofenzivní snahy favoritů.
            </p>

            <h2 className="pt-3 font-display text-2xl font-black text-white sm:text-3xl">
              Shrnutí a tip redakce
            </h2>
            <p>
              Analytický favorit: Kanada (vzhledem k šíři kádru a potvrzeným jménům).Zajímavá příležitost: Švýcarsko na zisk medaile (využití domácí výhody).Česká stopa: Umístění do 4. místa je reálným cílem, pokud se podaří nahradit chybějící produktivitu z NHL týmovým výkonem.
            </p>
            <p>
              Poznámka: Kurzy se mohou měnit v závislosti na konečných soupiskách a výsledcích posledních přípravných zápasů.
            </p>

          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/bracket"
              className="rounded-xl bg-gradient-to-r from-[#0090cc] to-[#00B4FF] px-4 py-2.5 text-sm font-black uppercase tracking-[0.14em] text-[#03050a] shadow-[0_0_24px_rgba(0,180,255,0.30)] ring-1 ring-white/15"
            >
              Otevřít Pick’em
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

