import Link from "next/link";
import { SitePageHero } from "@/components/site/SitePageHero";

export function KdoJsemContent() {
  return (
    <main className="pb-16 pt-2 sm:pb-20">
      <SitePageHero
        title="Kdo jsem"
        subtitle="Tady můžeš doplnit své jméno, odkaz na profil a příběh projektu — zatím je to stručná kostra."
      />
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="sestava-premium-panel-dark rounded-2xl p-5 shadow-[0_24px_64px_rgba(0,0,0,0.35)] sm:p-7">
          <div className="space-y-6 text-sm leading-relaxed text-white/82">
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
          <p className="mt-8 border-t border-white/[0.08] pt-6">
            <Link
              href="/"
              className="text-sm font-medium text-cyan-300/90 underline-offset-4 transition hover:text-cyan-200 hover:underline"
            >
              ← Zpět na úvod
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
