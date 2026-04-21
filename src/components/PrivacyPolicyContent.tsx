import Link from "next/link";
import { SitePageHero } from "@/components/site/SitePageHero";
import { SITE_CONTACT_EMAIL } from "@/lib/siteBranding";

const sectionClass = "sestava-premium-panel-dark rounded-2xl p-4 sm:p-5";

/** Datum „platné od“ — při větší změně obsahu aktualizujte. */
const EFFECTIVE_FROM = "14. dubna 2026";

export function PrivacyPolicyContent() {
  return (
    <main className="pb-16 pt-2 sm:pb-20">
      <SitePageHero
        title="Ochrana osobních údajů"
        subtitle={`Platné od ${EFFECTIVE_FROM} · GDPR`}
        align="center"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="mb-6 text-center text-xs text-white/45">
          Tyto zásady popisují zpracování osobních údajů ve webové aplikaci Lineup (fanouškovský editor nominace na MS v hokeji).
        </p>
        <div className="space-y-4 text-sm leading-relaxed text-white/78 sm:space-y-5">
          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              1. Správce osobních údajů
            </h2>
            <p className="mt-3 text-white/75">
              Správcem je provozovatel webu <strong className="text-white">hokejlineup.cz</strong> / aplikace Lineup (dále jen
              „služba“). Dotazy k ochraně osobních údajů posílejte na{" "}
              <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="font-semibold text-sky-300/90 underline-offset-4 hover:underline">
                {SITE_CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              2. Jaké údaje zpracováváme
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                <strong className="text-white">Údaje z účtu Google při přihlášení</strong> — zejména e-mailová adresa a případně
                jméno a profilový obrázek podle toho, co Google poskytne a co povolíte v dialogu přihlášení.
              </li>
              <li>
                <strong className="text-white">Údaje, které v aplikaci vytvoříte</strong> — například nominace, sestavy, příspěvky ve
                fóru nebo jiný obsah uložený ve službě v souvislosti s vaším účtem.
              </li>
              <li>
                <strong className="text-white">Technické a provozní údaje</strong> — například IP adresa, typ prohlížeče, základní
                protokolové údaje potřebné k zabezpečení a provozu serveru (viz také část o cookies níže).
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              3. Účely a právní základy zpracování
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                <strong className="text-white">Poskytování služby a uživatelského účtu</strong> (přihlášení, uložení nominace,
                soutěž, žebříčky, sdílení apod.) —{" "}
                <strong className="text-white">plnění smlouvy</strong> ve smyslu čl. 6 odst. 1 písm. b) GDPR (užití služby).
              </li>
              <li>
                <strong className="text-white">Plnění právních povinností</strong> (pokud nastanou) — čl. 6 odst. 1 písm. c) GDPR.
              </li>
              <li>
                <strong className="text-white">Oprávněný zájem</strong> — zabezpečení služby, prevence zneužití, řešení incidentů,
                základní analytika provozu; pokud zákon vyžaduje vyvážení vašich práv a našich zájmů — čl. 6 odst. 1 písm. f) GDPR.
              </li>
              <li>
                <strong className="text-white">Marketing a reklama</strong> — pokud bychom zaváděli např. zasílání obchodních
                sdělení e-mailem nebo personalizovanou reklamu nad rámec nezbytného provozu, budeme u takového zpracování typicky
                vyžadovat <strong className="text-white">váš výslovný souhlas</strong> (čl. 6 odst. 1 písm. a) GDPR) a upřesníme to
                v rozhraní služby. Samotné zobrazení reklamy na stránce může souviset s cookies třetích stran — viz níže.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              4. Přihlášení přes Google
            </h2>
            <p className="mt-3 text-white/75">
              Přihlášení zajišťuje společnost Google. Údaje zpracovává Google podle svých podmínek; zpracování údajů pro potřeby této
              služby popisují tyto zásady. Účet Google můžete spravovat ve svém profilu Google.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">5. Cookies a podobné technologie</h2>
            <p className="mt-3 text-white/75">
              Služba může používat cookies nezbytné pro fungování webu (např. session, bezpečnost). Pokud nasadíme analytiku nebo
              reklamní nástroje třetích stran vyžadující souhlas, doplníme mechanismus nastavení (banner / předvolby) a tento dokument.
              Aktuálně nepředpokládáme rozšířené profilování návštěvníků nad rámec provozu účtu.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              6. Příjemci a zpracovatelé
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                <strong className="text-white">Hosting a infrastruktura</strong> — poskytovatel hostingu (např. Railway), kde běží
                aplikace a databáze.
              </li>
              <li>
                <strong className="text-white">Google</strong> — přihlášení OAuth.
              </li>
              <li>
                Jiné subjekty pouze v rozsahu nezbytném pro daný účel (např. poskytovatel e-mailu pro transakční zprávy), po uzavření
                standardních smluv o zpracování podle GDPR tam, kde to zákon vyžaduje.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              7. Předávání do třetích zemí
            </h2>
            <p className="mt-3 text-white/75">
              U některých nástrojů (např. Google, cloudová infrastruktura) může docházet k předávání údajů mimo EU/EHP. V takovém
              případě se řídíme standardními smluvními doložkami EU nebo rozhodnutím o odpovídající ochraně podle GDPR.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              8. Doba uchovávání
            </h2>
            <p className="mt-3 text-white/75">
              Údaje uchováváme po dobu existence účtu a plnění služby, případně po dobu nutnou pro řešení sporů, oprávněné nároky a
              zákonné povinnosti. Po smazání účtu nebo na žádost údaje smažeme nebo anonymizujeme, pokud není nutné je dále uchovat ze
              zákona.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">9. Vaše práva</h2>
            <p className="mt-3 text-white/75">
              Máte právo na přístup k údajům, opravu, výmaz („být zapomenut“), omezení zpracování, přenositelnost údajů (je-li
              relevantní), vznést námitku proti zpracování založenému na oprávněném zájmu a právo podat stížnost u Úřadu pro ochranu
              osobních údajů (
              <a
                href="https://www.uoou.cz/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sky-300/90 underline-offset-4 hover:underline"
              >
                uoou.cz
              </a>
              ).
            </p>
            <p className="mt-3 text-white/75">
              Pokud je zpracování založeno na souhlasu, můžete souhlas kdykoli odvolat — odvolání nemá vliv na zákonnost zpracování
              před jeho odvoláním.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">10. Změny zásad</h2>
            <p className="mt-3 text-white/75">
              Tyto zásady můžeme aktualizovat; významnou změnu zde zvýrazníme a případně vás informujeme ve službě. Datum účinnosti je
              uvedeno v záhlaví stránky.
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
