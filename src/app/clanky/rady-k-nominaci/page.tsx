import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Rady k nominaci",
  description:
    "Článek: Rady k nominaci — tipy k sestavení nominace českého týmu na MS 2026 ve Švýcarsku.",
  alternates: { canonical: "/clanky/rady-k-nominaci" },
  openGraph: { url: "/clanky/rady-k-nominaci" },
};

export default function ArticleNominationTipsPage() {
  return (
    <main className="min-h-screen bg-transparent text-white">
      <div className="sticky top-0 z-40">
        <SiteHeader />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">
            Článek
          </p>
          <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">Rady k nominaci</h1>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-white/80 sm:text-base">
            <p>
              Blíží se Mistrovství světa v ledním hokeji 2026 ve Švýcarsku a hlavní trenér Radim Rulík má před sebou náročné rozhodování. Kdo nakonec oblékne národní dres? V našem interaktivním editoru sestavy si nyní můžeš vyzkoušet roli reprezentačního kouče, poskládat vlastní pětky a porovnat je s oficiální nominací.
            </p>

            <h2 className="pt-2 font-display text-xl font-black text-white">Aktuální posily z NHL: Kdo posílí český tým?</h2>
            <p>
              Letošní sezóna v zámoří napovídá, že národní tým by mohl mít velmi silný základ. Která jména byste v sestavě neměli vynechat?
            </p>

            <ul className="space-y-3">
              <li>
                <strong className="font-semibold text-white">Filip Hronek (Vancouver Canucks)</strong>: Pokud bude zdravotně v pořádku, jde o jasného lídra obrany. Jeho předností je elitní rozehrávka a tvrdá hra do těla.
              </li>
              <li>
                <strong className="font-semibold text-white">Adam Klapka (Calgary Flames) &amp; Jaroslav Chmelař (NY Rangers)</strong>: Typičtí „power forwardi“. Na širokém evropském kluzišti budou klíčoví pro důraz před brankou a hru proti fyzicky silným výběrům Kanady a USA.
              </li>
              <li>
                <strong className="font-semibold text-white">Hvězdy NHL</strong>: V ply-off NHL skončili David Pastrňák, Pavel Zacha a Tomáš Hertl. Hvězda Bostonu David Pastrňák se sice zatím ke svému příjezdu zatím vyjádřil spíše negativně, třeba ho však přemluví Roman Červenka, který již svou účast přislíbil. Bizarní situace panuje kolem Pastrňákova spoluhráče Pavla Zachy, se kterým se podle generálního manažera Jiřího Šlégra nelze telefonicky spojit. Ohledně Tomáše Hertl, jenž se v dresu Vegas v závěru sezony viditelně trápil, zatím media i vedení reprezentace mlčí.
              </li>
              <li>
                <strong className="font-semibold text-white">Mladá krev z AHL</strong>: Hráči jako Melovský, Kunc, Hovorka nebo Alsher bojují o svou šanci a do týmu mohou vnést dravost a rychlost, která v moderním hokeji rozhoduje. V play-off AHL sice čerstvě skončili hráči jako Matyáš Šapovaliv nebo Jakub Brabenec (Henderson Silver Knights), jejich příjezd je však vzhledem k pokročilé fázi přípravy a náročné logistice v podstatě vyloučen. Trenérský štáb se raději soustředí na hráče, kteří s týmem absolvovali celý kemp.
              </li>
              <li>
                <strong className="font-semibold text-white">Brankářská otázka</strong>: Brankářská otázka: Situace v brankovišti zůstává pro letošní šampionát velmi otevřená. Po vypadnutí Utahu z bojů o Stanley Cup jsou sice k dispozici Karel Vejmelka i Vítek Vaněček, ale jejich konečné zapojení do týmu je zatím v řešení. Kolem Davida Ritticha panuje informační šum a jeho příjezd do Švýcarska je nejistý. Vedení reprezentace pravděpodobně vyčkává i na další vývoj v zámoří, konkrétně na dostupnost Lukáše Dostála nebo Jakuba Dobeše. Stále však existuje varianta, že trenéři nakonec vsadí na aktuální trojici, která v týmu figuruje nyní a absolvovala převážnou část přípravy.
              </li>
              <li>
                <strong className="font-semibold text-white">Ostatní hráči</strong>: Mimo sledované posily z NHL má trenér Rulík k dispozici několik dalších variant, i když prostor pro změny v sestavě se zužuje. Hlavním otazníkem zůstává Lukáš Sedlák, který po náročném finále extraligy doléčuje šrámy a o jeho startu rozhodne aktuální zdravotní stav. U dalších finalistů, jako jsou Jan Koštálek, Daniel Gazda, Ondřej Kovařčík nebo Tomáš Kundrátek, je dodatečná nominace po začátku Beijer Hockey Games už málo pravděpodobná. Jisté je, že tým letos neposílí Matěj Stránský ani Filip Zadina, kteří se z rodinných a zdravotních důvodů omluvili. Malá teoretická šance na dopsání zůstává u krajánků ze severu – Luboše Horkého (Rögle), Lukáše Jaška nebo Radka Kučeříka (Ilves) – ovšem jejich zapojení realizační tým momentálně spíše neplánuje.
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/sestava"
              className="rounded-xl bg-gradient-to-r from-[#0090cc] to-[#00B4FF] px-4 py-2.5 text-sm font-black uppercase tracking-[0.14em] text-[#03050a] shadow-[0_0_24px_rgba(0,180,255,0.30)] ring-1 ring-white/15"
            >
              Otevřít editor nominace
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

