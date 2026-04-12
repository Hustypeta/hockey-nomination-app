import Link from "next/link";

const sectionClass =
  "rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 sm:px-5 sm:py-5";
const sectionAmberClass =
  "rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-4 sm:px-5 sm:py-5";

export function ContestRulesContent() {
  return (
    <main className="border-t border-white/[0.06] bg-[#080d16]/60 py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-center font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
          Pravidla soutěže
        </h1>
        <p className="mx-auto mt-2 text-center text-base font-medium text-white/80 sm:text-lg">
          Nominace na MS v hokeji 2026
        </p>

        <div className="mt-10 space-y-4 text-sm leading-relaxed text-white/75 sm:space-y-5">
          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              1. Základní ustanovení
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>Účast v soutěži je bezplatná.</li>
              <li>
                Podmínkou pro zařazení do vyhodnocení je uložení kompletní nominace k uživatelskému účtu nejpozději do{" "}
                <strong className="text-white">13. května 2026, 23:59 (středoevropský čas)</strong>.
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
              data finálního uložení nominace:
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
              <li>
                Od <strong className="text-white">11. května 2026</strong> do uzávěrky: bez časového bonusu (
                <strong className="text-white">0 %</strong>).
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
            <p className="mt-3 rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-xs leading-relaxed text-white/60 sm:text-sm">
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

          <section className={sectionAmberClass}>
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
                Tato pravidla jsou orientační. Finální znění bude upřesněno a zasláno účastníkům e-mailem před zahájením
                platnosti soutěže.
              </li>
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
