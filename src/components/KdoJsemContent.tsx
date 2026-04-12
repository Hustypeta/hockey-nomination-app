import Link from "next/link";

export function KdoJsemContent() {
  return (
    <main className="py-14 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Kdo jsem</h1>
        <p className="mt-2 text-sm text-white/50">
          Tady můžeš doplnit své jméno, odkaz na profil a příběh projektu — zatím je to stručná kostra.
        </p>
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-white/80">
          <p>
            Jsem fanoušek českého hokeje a tuhle hru stavím jako{" "}
            <strong className="text-white">projekt pro komunitu</strong>: transparentně, bez zbytečného balastu, s respektem
            k oficiálním materiálům reprezentace.
          </p>
          <p>
            Editor sestavy a soutěž jsou <strong className="text-white">nezávislé na ČSLH</strong> — jde o fanouškovskou
            zábavu a srovnání tipů s reálnou nominací a zápisem z utkání.
          </p>
          <p className="text-white/55">
            (Doplň: kontakt, sociální sítě, případně krátké video nebo fotku — podle toho, co chceš sdílet veřejně.)
          </p>
        </div>
        <p className="mt-12">
          <Link
            href="/"
            className="text-sm font-medium text-cyan-300/90 underline-offset-4 transition hover:text-cyan-200 hover:underline"
          >
            ← Zpět na úvod
          </Link>
        </p>
      </div>
    </main>
  );
}
