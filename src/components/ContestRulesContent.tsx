import Link from "next/link";
import { SitePageHero } from "@/components/site/SitePageHero";

const sectionClass = "sestava-premium-panel-dark rounded-2xl p-4 sm:p-5";
const sectionGoldClass =
  "sestava-premium-panel-dark rounded-2xl p-4 ring-1 ring-[#f1c40f]/28 shadow-[0_0_48px_rgba(241,196,15,0.07)] sm:p-5";

export function ContestRulesContent() {
  return (
    <main className="pb-16 pt-2 sm:pb-20">
      <SitePageHero title="Pravidla soutěže" subtitle="Nominace na MS v hokeji 2026" align="center" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="space-y-4 text-sm leading-relaxed text-white/78 sm:space-y-5">
          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              1. Základní ustanovení
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>Účast v soutěži je bezplatná.</li>
              <li>
                <strong className="text-white">Nominaci do soutěže je z každého účtu možné poslat pouze jednou.</strong>{" "}
                Koncepty sestavy můžeš u účtu ukládat opakovaně; do vyhodnocení se započítá až odeslání soutěžní nominace
                nejpozději do{" "}
                <strong className="text-white">10. května 2026, 23:59 (středoevropský čas)</strong>.
              </li>
              <li>Editor sestavy lze využívat k soukromým účelům i bez odeslání do soutěže.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              2. Časový bonus (koeficient včasného odeslání)
            </h2>
            <p className="mt-3 text-white/75">
              Body získané za správné tipy hráčů (vyjma bonusů za kapitána a asistenty) se násobí koeficientem podle
              data <strong className="text-white">odeslání nominace do soutěže</strong> (jednorázové tlačítko v editoru):
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-white/75">
              <li>
                Do <strong className="text-white">30. dubna 2026</strong> (včetně): bonus{" "}
                <strong className="text-white">+40 %</strong> ke skóre.
              </li>
              <li>
                Do <strong className="text-white">7. května 2026</strong> (včetně): bonus{" "}
                <strong className="text-white">+25 %</strong> ke skóre.
              </li>
              <li>
                Do <strong className="text-white">10. května 2026</strong> (včetně): bonus{" "}
                <strong className="text-white">+10 %</strong> ke skóre.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              3. Metodika vyhodnocení
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                Základem pro vyhodnocení jsou oficiální dokumenty k prvnímu zápasu české reprezentace na MS 2026,
                konkrétně oficiální soupiska (25 hráčů) a zápis o utkání.
              </li>
              <li>Rozhodující je rozestavení hráčů v zápisu o utkání (formace, obranné páry, pozice brankářů).</li>
              <li>
                Přesné mapování uživatelských slotů v aplikaci na řádky v oficiálním zápisu bude specifikováno v plném
                znění pravidel před startem soutěže.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              4. Bodování hráčů
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2.5 text-white/75">
              <li>
                <strong className="text-white">5 bodů (přesná pozice):</strong> Hráč figuruje v nominaci na shodném místě
                jako v oficiálním zápisu o utkání (např. konkrétní útočné křídlo, střední útočník, obránce v daném páru
                nebo konkrétní pozice brankáře).
              </li>
              <li>
                <strong className="text-white">2 body (shoda jména):</strong> Hráč je uveden na oficiální soupisce pro
                daný zápas, ale v uživatelské nominaci je zařazen na jinou pozici.
              </li>
            </ul>
            <p className="mt-3 rounded-lg border border-white/[0.1] bg-black/30 px-3 py-2.5 text-xs leading-relaxed text-white/62 sm:text-sm">
              <strong className="text-white/80">Poznámka k bodování:</strong> Body za pozici a jméno se nesčítají; za
              jednoho hráče lze získat maximálně 5 bodů. Pokud se tvoje rozestavení v editoru liší od oficiálního zápisu o
              utkání, u hráčů mimo odpovídající slot se započítává především shoda jména v dané kategorii (G / D / F).
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              5. Bonusy za kapitána a asistenty
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                <strong className="text-white">+10 bodů:</strong> Správné určení kapitána týmu (shoda s označením „C“ v
                oficiálním zápisu).
              </li>
              <li>
                <strong className="text-white">+4 body:</strong> Správné určení asistenta (shoda s označením „A“ v
                oficiálním zápisu, lze započítat maximálně dva asistenty).
              </li>
              <li>Na tyto bonusové body se nevztahuje násobení časovým koeficientem.</li>
            </ul>
          </section>

          <section className={sectionGoldClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              6. Ceny a pořadí
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                Žebříček všech platných nominací bude zveřejněn na webových stránkách po zpracování oficiálních
                výsledků.
              </li>
              <li>
                <strong className="text-white">1. místo:</strong> Hokejový dres (specifikace typu a velikosti bude
                upřesněna s vítězem).
              </li>
              <li>
                <strong className="text-white">2. a 3. místo:</strong> Věcné ceny s hokejovou tematikou.
              </li>
              <li>
                U prvních tří umístění bude na stránkách zveřejněn odborný komentář k nominaci, případně krátké
                videohodnocení.
              </li>
              <li>
                V případě rovnosti bodů rozhoduje o pořadí dřívější čas odeslání platné nominace, následně los.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              7. Závěrečné informace
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                Veškeré časové údaje se řídí kalendářním datem a časem platným v České republice (pásmo{" "}
                <strong className="text-white">Europe/Prague</strong>).
              </li>
            </ul>
          </section>
        </div>

        <p className="mt-10 text-center">
          <Link
            href="/sestava"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-500/15"
          >
            Otevřít editor sestavy
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-white/50 underline-offset-4 transition hover:text-white/75 hover:underline"
          >
            Zpět na úvod
          </Link>
        </p>
      </div>
    </main>
  );
}
