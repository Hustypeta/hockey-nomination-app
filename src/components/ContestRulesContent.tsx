import Link from "next/link";
import { CONTEST_DEADLINE_CS } from "@/lib/contestTimeBonus";
import { SitePageHero } from "@/components/site/SitePageHero";

const sectionClass = "sestava-premium-panel-dark rounded-2xl p-4 sm:p-5";
const sectionGoldClass =
  "sestava-premium-panel-dark rounded-2xl p-4 ring-1 ring-[#f1c40f]/28 shadow-[0_0_48px_rgba(241,196,15,0.07)] sm:p-5";

export function ContestRulesContent() {
  return (
    <main className="pb-16 pt-2 sm:pb-20">
      <SitePageHero title="Pravidla" subtitle="SoutÄ›Ĺľ (nominace) a Pickâ€™em" align="center" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="space-y-4 text-sm leading-relaxed text-white/78 sm:space-y-5">
          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              Pravidla soutÄ›Ĺľe (nominace)
            </h2>
            <p className="mt-3 text-white/75">
              Tato ÄŤĂˇst popisuje soutÄ›Ĺľ o ceny zaloĹľenou na odeslĂˇnĂ­ nominace. Pod nĂ­ najdeĹˇ samostatnÄ›{" "}
              <Link href="/bracket" className="text-cyan-200/90 underline-offset-4 hover:underline">
                pravidla Pickâ€™em
              </Link>{" "}
              (tipovĂˇnĂ­ skupin a play-off).
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              1. ZĂˇkladnĂ­ ustanovenĂ­
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>ĂšÄŤast v soutÄ›Ĺľi je bezplatnĂˇ.</li>
              <li>
                <strong className="text-white">Nominaci do soutÄ›Ĺľe je z kaĹľdĂ©ho ĂşÄŤtu moĹľnĂ© poslat pouze jednou.</strong>{" "}
                Koncepty sestavy mĹŻĹľeĹˇ u ĂşÄŤtu uklĂˇdat opakovanÄ›; do vyhodnocenĂ­ se zapoÄŤĂ­tĂˇ aĹľ odeslĂˇnĂ­ soutÄ›ĹľnĂ­ nominace
                nejpozdÄ›ji do{" "}
                <strong className="text-white">{CONTEST_DEADLINE_CS}</strong>.
              </li>
              <li>Editor nominace lze vyuĹľĂ­vat k soukromĂ˝m ĂşÄŤelĹŻm i bez odeslĂˇnĂ­ do soutÄ›Ĺľe.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              2. ÄŚasovĂ˝ bonus (koeficient vÄŤasnĂ©ho odeslĂˇnĂ­)
            </h2>
            <p className="mt-3 text-white/75">
              Body zĂ­skanĂ© za sprĂˇvnĂ© tipy hrĂˇÄŤĹŻ (vyjma bonusĹŻ za kapitĂˇna a asistenty) se nĂˇsobĂ­ koeficientem podle
              data <strong className="text-white">odeslĂˇnĂ­ nominace do soutÄ›Ĺľe</strong> (jednorĂˇzovĂ© tlaÄŤĂ­tko v editoru):
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-white/75">
              <li>
                Do <strong className="text-white">30. dubna 2026</strong> (vÄŤetnÄ›): bonus{" "}
                <strong className="text-white">+40 %</strong> ke skĂłre.
              </li>
              <li>
                Do <strong className="text-white">7. kvÄ›tna 2026</strong> (vÄŤetnÄ›): bonus{" "}
                <strong className="text-white">+25 %</strong> ke skĂłre.
              </li>
              <li>
                Do <strong className="text-white">10. kvÄ›tna 2026</strong> (vÄŤetnÄ›): bonus{" "}
                <strong className="text-white">+10 %</strong> ke skĂłre.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              3. Metodika vyhodnocenĂ­
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                ZĂˇkladem pro vyhodnocenĂ­ jsou oficiĂˇlnĂ­ dokumenty k prvnĂ­mu zĂˇpasu ÄŤeskĂ© reprezentace na MS 2026,
                konkrĂ©tnÄ› oficiĂˇlnĂ­ soupiska (25 hrĂˇÄŤĹŻ) a zĂˇpis o utkĂˇnĂ­.
              </li>
              <li>RozhodujĂ­cĂ­ je rozestavenĂ­ hrĂˇÄŤĹŻ v zĂˇpisu o utkĂˇnĂ­ (formace, obrannĂ© pĂˇry, pozice brankĂˇĹ™ĹŻ).</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              4. BodovĂˇnĂ­ hrĂˇÄŤĹŻ
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2.5 text-white/75">
              <li>
                <strong className="text-white">5 bodĹŻ (pĹ™esnĂˇ pozice):</strong> HrĂˇÄŤ figuruje v nominaci na shodnĂ©m mĂ­stÄ›
                jako v oficiĂˇlnĂ­m zĂˇpisu o utkĂˇnĂ­ (napĹ™. konkrĂ©tnĂ­ ĂştoÄŤnĂ© kĹ™Ă­dlo, stĹ™ednĂ­ ĂştoÄŤnĂ­k, obrĂˇnce v danĂ©m pĂˇru
                nebo konkrĂ©tnĂ­ pozice brankĂˇĹ™e).
              </li>
              <li>
                <strong className="text-white">2 body (shoda jmĂ©na):</strong> HrĂˇÄŤ je uveden na oficiĂˇlnĂ­ soupisce pro
                danĂ˝ zĂˇpas, ale v uĹľivatelskĂ© nominaci je zaĹ™azen na jinou pozici.
              </li>
            </ul>
            <p className="mt-3 rounded-lg border border-white/[0.1] bg-black/30 px-3 py-2.5 text-xs leading-relaxed text-white/62 sm:text-sm">
              <strong className="text-white/80">PoznĂˇmka k bodovĂˇnĂ­:</strong> Body za pozici a jmĂ©no se nesÄŤĂ­tajĂ­; za
              jednoho hrĂˇÄŤe lze zĂ­skat maximĂˇlnÄ› 5 bodĹŻ. Pokud se tvoje rozestavenĂ­ v editoru liĹˇĂ­ od oficiĂˇlnĂ­ho zĂˇpisu o
              utkĂˇnĂ­, u hrĂˇÄŤĹŻ mimo odpovĂ­dajĂ­cĂ­ slot se zapoÄŤĂ­tĂˇvĂˇ pĹ™edevĹˇĂ­m shoda jmĂ©na v danĂ© kategorii (G / D / F).
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              5. Bonusy za kapitĂˇna a asistenty
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                <strong className="text-white">+10 bodĹŻ:</strong> SprĂˇvnĂ© urÄŤenĂ­ kapitĂˇna tĂ˝mu (shoda s oznaÄŤenĂ­m â€žCâ€ś v
                oficiĂˇlnĂ­m zĂˇpisu).
              </li>
              <li>
                <strong className="text-white">+4 body:</strong> SprĂˇvnĂ© urÄŤenĂ­ asistenta (shoda s oznaÄŤenĂ­m â€žAâ€ś v
                oficiĂˇlnĂ­m zĂˇpisu, lze zapoÄŤĂ­tat maximĂˇlnÄ› dva asistenty).
              </li>
              <li>Na tyto bonusovĂ© body se nevztahuje nĂˇsobenĂ­ ÄŤasovĂ˝m koeficientem.</li>
            </ul>
          </section>

          <section className={sectionGoldClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              6. Ceny a poĹ™adĂ­
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                Ĺ˝ebĹ™Ă­ÄŤek platnĂ˝ch nominacĂ­ zveĹ™ejnĂ­me na tomto webu{" "}
                <strong className="text-white">aĹľ po zveĹ™ejnÄ›nĂ­ oficiĂˇlnĂ­ soupisky reprezentace</strong> a zpracovĂˇnĂ­
                vĂ˝sledkĹŻ dle pravidel.
              </li>
              <li>
                <strong className="text-white">1. mĂ­sto:</strong> HokejovĂ˝ dres (specifikace typu a velikosti bude
                upĹ™esnÄ›na s vĂ­tÄ›zem).
              </li>
              <li>
                <strong className="text-white">2. a 3. mĂ­sto:</strong> VÄ›cnĂ© ceny s hokejovou tematikou.
              </li>
              <li>
                V pĹ™Ă­padÄ› rovnosti bodĹŻ rozhoduje o poĹ™adĂ­ dĹ™Ă­vÄ›jĹˇĂ­ ÄŤas odeslĂˇnĂ­ platnĂ© nominace, nĂˇslednÄ› los.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              7. ZĂˇvÄ›reÄŤnĂ© informace
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                VeĹˇkerĂ© ÄŤasovĂ© Ăşdaje se Ĺ™Ă­dĂ­ kalendĂˇĹ™nĂ­m datem a ÄŤasem platnĂ˝m v ÄŚeskĂ© republice (pĂˇsmo{" "}
                <strong className="text-white">Europe/Prague</strong>).
              </li>
            </ul>
          </section>

          <section className={sectionGoldClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              Pravidla Pickâ€™em
            </h2>
            <p className="mt-3 text-white/75">
              Pickâ€™em je tipovacĂ­ hra k MS 2026. Tipy se poÄŤĂ­tajĂ­ ze{" "}
              <strong className="text-white">vĹˇech zĂˇpasĹŻ turnaje</strong> (skupiny i play-off) podle{" "}
              <strong className="text-white">oficiĂˇlnĂ­ch statistik IIHF</strong>. Pokud mĂˇĹˇ uloĹľenĂ© tipy, mĹŻĹľeĹˇ je sdĂ­let
              odkazem.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              P1. Co se tipuje
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                <strong className="text-white">PoĹ™adĂ­ skupin:</strong> celĂ© poĹ™adĂ­ ve skupinÄ› A i B (1.â€“8. mĂ­sto).
              </li>
              <li>
                <strong className="text-white">Play-off pavouk:</strong> ÄŤtvrtfinĂˇle, semifinĂˇle, finĂˇle a zĂˇpas o bronz.
              </li>
              <li>
                <strong className="text-white">BonusovĂ© tipy (ÄŚesko):</strong>{" "}
                nejlepĹˇĂ­ ÄŤeskĂ˝ stĹ™elec, nejlepĹˇĂ­ ÄŤeskĂ˝ hrĂˇÄŤ v bodovĂˇnĂ­, nejtrestanÄ›jĹˇĂ­ ÄŤeskĂ˝ hrĂˇÄŤ (PIM), poÄŤet gĂłlĹŻ ÄŤeskĂ©ho
                tĂ˝mu, poÄŤet trestnĂ˝ch minut ÄŤeskĂ©ho tĂ˝mu.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              P2. UzĂˇvÄ›rka tipĹŻ
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                TipovĂˇnĂ­ Pickâ€™em se uzavĂ­rĂˇ{" "}
                <strong className="text-white">pĹ™ed zaÄŤĂˇtkem MS 2026</strong> (konkrĂ©tnĂ­ datum a ÄŤas bude zobrazen pĹ™Ă­mo na
                strĂˇnce Pickâ€™em).
              </li>
              <li>Po uzĂˇvÄ›rce lze tipy pouze zobrazit (readâ€‘only).</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
              P3. BodovĂˇnĂ­
            </h2>
            <p className="mt-3 text-white/75">
              BodovĂˇnĂ­ je nastavenĂ© tak, aby dĂˇvalo smysl jak pro skupiny, tak pro play-off a bonusy. VyhodnocenĂ­ se provede
              po skonÄŤenĂ­ turnaje podle oficiĂˇlnĂ­ch vĂ˝sledkĹŻ.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-white/75">
              <li>
                <strong className="text-white">Skupiny (A/B):</strong> 2 body za kaĹľdĂ˝ tĂ˝m na pĹ™esnĂ© pozici (1.â€“8.).
              </li>
              <li>
                <strong className="text-white">ÄŚtvrtfinĂˇle:</strong> 3 body za sprĂˇvnÄ› urÄŤenĂ©ho postupujĂ­cĂ­ho v kaĹľdĂ©m
                zĂˇpase.
              </li>
              <li>
                <strong className="text-white">SemifinĂˇle:</strong> 4 body za sprĂˇvnÄ› urÄŤenĂ©ho postupujĂ­cĂ­ho.
              </li>
              <li>
                <strong className="text-white">FinĂˇle:</strong> 6 bodĹŻ za mistra.
              </li>
              <li>
                <strong className="text-white">Bronz:</strong> 3 body za vĂ­tÄ›ze zĂˇpasu o bronz.
              </li>
              <li>
                <strong className="text-white">Bonusy:</strong> 5 bodĹŻ za kaĹľdou sprĂˇvnou poloĹľku (CZ stĹ™elec, CZ body,
                CZ PIM, gĂłly ÄŚR, PIM ÄŚR).
              </li>
            </ul>
            <p className="mt-3 rounded-lg border border-white/[0.1] bg-black/30 px-3 py-2.5 text-xs leading-relaxed text-white/62 sm:text-sm">
              <strong className="text-white/80">PoznĂˇmka:</strong> PIM = trestnĂ© minuty podle oficiĂˇlnĂ­ch statistik IIHF.
              GĂłlovĂ© i trestnĂ© souÄŤty ÄŤeskĂ©ho tĂ˝mu se poÄŤĂ­tajĂ­ za celĂ˝ turnaj (skupiny + playâ€‘off).
            </p>
          </section>
        </div>

        <p className="mt-10 text-center">
          <Link
            href="/editorsestavy"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-500/15"
          >
            OtevĹ™Ă­t editor nominace
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link
            href="/bracket"
            className="text-sm font-medium text-cyan-200/90 underline-offset-4 transition hover:text-cyan-100 hover:underline"
          >
            OtevĹ™Ă­t Pickâ€™em
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-white/50 underline-offset-4 transition hover:text-white/75 hover:underline"
          >
            ZpÄ›t na Ăşvod
          </Link>
        </p>
      </div>
    </main>
  );
}

