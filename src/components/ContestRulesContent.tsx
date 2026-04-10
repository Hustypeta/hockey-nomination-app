import Link from "next/link";

export function ContestRulesContent() {
  return (
    <main className="border-t border-white/[0.06] bg-[#080d16]/60 py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-center font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
          Pravidla soutěže
        </h1>
        <p className="mx-auto mt-3 text-center text-sm text-white/50">
          Orientační pravidla — před startem platnosti je upřesníme na stránce a v e-mailu pro účastníky.
        </p>
        <ul className="mt-8 space-y-4 text-sm leading-relaxed text-white/75">
          <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <span className="font-bold text-amber-300">•</span>
            <span>
              <strong className="text-white">Vstupenka do soutěže 50&nbsp;Kč</strong> (zaplacená přes platební
              bránu). Bez úhrady se nominace do vyhodnocení nezapočítává.
            </span>
          </li>
          <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <span className="font-bold text-amber-300">•</span>
            <span>
              Vyhodnocení jde z <strong className="text-white">oficiálních dokumentů k 1. zápasu ČR</strong> na MS
              2026: <strong className="text-white">soupiska</strong> (25 hráčů) a{" "}
              <strong className="text-white">zápis o utkání</strong> (rozestavení — kdo je kde: lajny, páry beků,
              brankáři včetně náhradníků podle toho, jak to bude v zápise uvedené).
            </span>
          </li>
          <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <span className="font-bold text-amber-300">•</span>
            <div>
              <strong className="text-white">Bodování hráčů (návrh) — dvě úrovně</strong>
              <ul className="mt-2 list-inside list-disc space-y-2 text-white/70">
                <li>
                  <strong className="text-white/90">5 bodů — přesná pozice:</strong> hráč je v tvé nominaci na{" "}
                  <strong className="text-white">stejném „místě“ jako v oficiálním zápisu o utkání</strong> (např. totéž
                  křídlo / střed / bek v tom samém páru / stejný slot brankáře či náhradníka, jak to vyjde ze zápisu).
                </li>
                <li>
                  <strong className="text-white/90">2 body — jen trefené jméno:</strong> hráč je mezi{" "}
                  <strong className="text-white">25 na soupisce</strong> k tomu zápasu, ale v tvé sestavě ho máš{" "}
                  <strong className="text-white">na jiné pozici</strong> než v oficiálním zápisu (počítá se jen jedna z
                  úrovní — nepřičítají se obě najednou).
                </li>
                <li>
                  <strong className="text-white/90">+10 bodů</strong> za správně zvoleného{" "}
                  <strong className="text-white">kapitána</strong> (shoda s „C“ u týmu dle oficiálního zápisu k 1.
                  zápasu).
                </li>
                <li>
                  <strong className="text-white/90">+4 body</strong> za každého trefeného{" "}
                  <strong className="text-white">asistenta</strong> (max. 2 ve tvé nominaci; shoda s označením v
                  zápisu).
                </li>
              </ul>
              <p className="mt-2 text-xs text-white/45">
                Mapování tvých slotů (včetně náhradníků) na řádky v zápisu upřesníme v plných pravidlech, ať je
                vyhodnocení jednoznačné. Při shodě skóre rozhodne dřívější platná úhrada vstupenky, případně los.
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
            <span className="font-bold text-amber-200">•</span>
            <div>
              <strong className="text-white">Ceny</strong>
              <ul className="mt-2 list-inside list-disc space-y-1.5 text-white/75">
                <li>
                  <strong className="text-white/90">Žebříček</strong> všech platných nominací{" "}
                  <strong className="text-white">zveřejníme na webu</strong> po vyhodnocení.
                </li>
                <li>
                  U <strong className="text-white">1.–3. místa</strong> bude k nominaci{" "}
                  <strong className="text-white">komentář</strong> (písemně na stránce) nebo{" "}
                  <strong className="text-white">krátké video</strong> — podle domluvy a času.
                </li>
                <li>
                  <strong className="text-white/90">1. místo:</strong> <strong className="text-white">hokejový dres</strong>{" "}
                  (typ / velikost / klub upřesníme s výhercem).
                </li>
                <li>
                  <strong className="text-white/90">2. a 3. místo:</strong>{" "}
                  <strong className="text-white">menší ceny</strong> (např. suvenýr nebo doplňky kolem hokeje — konkrétní
                  položky doplníme před startem soutěže).
                </li>
              </ul>
            </div>
          </li>
        </ul>
        <p className="mt-6 text-center text-xs text-white/40">
          Přesný termín uzávěrky a start plateb upřesníme před ostrým startem. Sestavovač můžeš používat i bez vstupu do
          soutěže.
        </p>
        <p className="mt-8 text-center">
          <Link
            href="/sestava"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-500/15"
          >
            Otevřít sestavovač
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
