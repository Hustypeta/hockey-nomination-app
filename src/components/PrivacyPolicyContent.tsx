import Link from "next/link";
import { SitePageHero } from "@/components/site/SitePageHero";

const sectionClass = "sestava-premium-panel-dark rounded-2xl p-4 sm:p-5";

/** Datum poslední aktualizace — při větší změně obsahu aktualizujte. */
const EFFECTIVE_FROM = "21. dubna 2026";

const PRIVACY_CONTACT_EMAIL = "petr.hustak263@gmail.com";

export function PrivacyPolicyContent() {
  return (
    <main className="pb-16 pt-2 sm:pb-20">
      <SitePageHero
        title="Zásady ochrany osobních údajů"
        subtitle={`Poslední aktualizace: ${EFFECTIVE_FROM} · GDPR`}
        align="center"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="mb-6 text-center text-sm leading-relaxed text-white/78">
          Tyto zásady popisují, jakým způsobem nakládáme s vašimi osobními údaji v rámci provozu webu hokejlineup.cz a aplikace
          Lineup (dále jen „služba“). Ochrana vašeho soukromí je pro nás prioritou a při zpracování údajů postupujeme v souladu s
          nařízením GDPR.
        </p>
        <div className="space-y-4 text-sm leading-relaxed text-white/78 sm:space-y-5">
          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              1. Správce osobních údajů
            </h2>
            <p className="mt-3 text-white/75">
              Správcem osobních údajů je provozovatel služby hokejlineup.cz. V případě jakýchkoli dotazů ohledně ochrany soukromí
              nebo uplatnění vašich práv nás můžete kontaktovat na e-mailové adrese:{" "}
              <a
                href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
                className="font-semibold text-sky-300/90 underline-offset-4 hover:underline"
              >
                {PRIVACY_CONTACT_EMAIL}
              </a>
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              2. Rozsah zpracovávaných údajů
            </h2>
            <p className="mt-3 text-white/75">
              Zpracováváme pouze údaje nezbytné pro zajištění funkčnosti služby a vaši účast v soutěžích:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                <strong className="text-white">Údaje z účtu Google:</strong> Při přihlášení zpracováváme zejména vaši e-mailovou
                adresu, jméno a profilový obrázek. Rozsah těchto údajů závisí na tom, jaké informace poskytujete společnosti Google a
                co povolíte v dialogu pro přihlášení.
              </li>
              <li>
                <strong className="text-white">Obsah vytvořený uživatelem:</strong> Údaje, které do aplikace sami vložíte — například
                vaše nominace, sestavy, příspěvky ve fóru nebo jiný obsah spojený s vaším účtem.
              </li>
              <li>
                <strong className="text-white">Technické a provozní údaje:</strong> IP adresa, typ prohlížeče a základní
                protokolové údaje (logy) nezbytné pro zajištění bezpečnosti serveru a stabilitu služby.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              3. Účel a právní základ zpracování
            </h2>
            <p className="mt-3 text-white/75">
              Vaše údaje zpracováváme na základě následujících právních titulů:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-3 text-white/75">
              <li>
                <strong className="text-white">Plnění smlouvy</strong> (čl. 6 odst. 1 písm. b) GDPR): Abychom vám mohli poskytovat
                samotnou službu (vytvoření účtu, uložení nominací, účast v soutěžích o dresy, žebříčky a sdílení obsahu).
              </li>
              <li>
                <strong className="text-white">Oprávněný zájem</strong> (čl. 6 odst. 1 písm. f) GDPR): Zajištění bezpečnosti služby,
                prevence podvodů a zneužití, řešení technických incidentů a provádění základní anonymní analytiky provozu.
              </li>
              <li>
                <strong className="text-white">Plnění právních povinností</strong> (čl. 6 odst. 1 písm. c) GDPR): Pokud nám uchování
                údajů ukládá zákon (např. v souvislosti s daněmi nebo účetnictvím u výherců soutěží).
              </li>
              <li>
                <strong className="text-white">Souhlas</strong> (čl. 6 odst. 1 písm. a) GDPR): V případě zasílání marketingových
                sdělení nebo pokročilé personalizované reklamy vás vždy požádáme o výslovný souhlas přímo v rozhraní aplikace.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              4. Přihlášení prostřednictvím Google
            </h2>
            <p className="mt-3 text-white/75">
              Autentizaci uživatelů zajišťuje společnost Google LLC. Proces zpracování údajů ze strany společnosti Google se řídí jejich
              vlastními podmínkami ochrany osobního soukromí. Propojení se službou Lineup můžete kdykoli spravovat nebo zrušit v
              nastavení svého Google účtu.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              5. Cookies a technické ukládání
            </h2>
            <p className="mt-3 text-white/75">
              Služba využívá soubory cookies nezbytné pro její technické fungování (např. přihlášení, zabezpečení relace). V případě
              využívání analytických nebo reklamních nástrojů třetích stran, které vyžadují souhlas, vám bude zobrazen cookie banner
              pro nastavení vašich preferencí.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              6. Příjemci a zpracovatelé údajů
            </h2>
            <p className="mt-3 text-white/75">
              K vašim údajům mají přístup pouze prověření dodavatelé, kteří zajišťují provoz technické infrastruktury:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                <strong className="text-white">Poskytovatel hostingu:</strong> (např. Railway) – infrastruktura pro běh aplikace a
                databáze.
              </li>
              <li>
                <strong className="text-white">Společnost Google:</strong> Poskytovatel služby OAuth pro přihlašování.
              </li>
              <li>
                <strong className="text-white">Další subjekty:</strong> Pouze v nezbytném rozsahu (např. doručovací služby v případě
                zasílání výhry ze soutěže).
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              7. Předávání údajů do třetích zemí
            </h2>
            <p className="mt-3 text-white/75">
              Vzhledem k využití globálních služeb (Google, cloudová infrastruktura) může docházet k předávání údajů mimo EU/EHP. V
              takových případech je ochrana zajištěna prostřednictvím standardních smluvních doložek EU nebo rozhodnutím o odpovídající
              ochraně dat.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              8. Doba uchovávání údajů
            </h2>
            <p className="mt-3 text-white/75">
              Údaje uchováváme po dobu existence vašeho uživatelského účtu nebo po dobu nezbytnou k plnění účelu (např. do vyhodnocení
              soutěže). Po smazání účtu nebo na vaši žádost údaje vymažeme či anonymizujeme, pokud nám zákon neukládá povinnost jejich
              další archivace.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">9. Vaše práva</h2>
            <p className="mt-3 text-white/75">Podle GDPR máte právo:</p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>na přístup k vašim osobním údajům a informaci, jak je zpracováváme,</li>
              <li>na opravu nepřesných údajů,</li>
              <li>na výmaz údajů („právo být zapomenut“),</li>
              <li>na omezení zpracování,</li>
              <li>vznést námitku proti zpracování založeném na oprávněném zájmu,</li>
              <li>na přenositelnost údajů,</li>
              <li>
                podat stížnost u Úřadu pro ochranu osobních údajů (
                <a
                  href="https://www.uoou.cz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-300/90 underline-offset-4 hover:underline"
                >
                  www.uoou.cz
                </a>
                ).
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">10. Změny těchto zásad</h2>
            <p className="mt-3 text-white/75">
              Tyto zásady můžeme v závislosti na vývoji služby aktualizovat. O významných změnách vás budeme informovat přímo v aplikaci
              nebo upozorněním na webu.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">11. Další odkazy</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                <Link href="/pravidla-souteze" className="font-semibold text-sky-300/90 underline-offset-4 hover:underline">
                  Pravidla soutěže
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
