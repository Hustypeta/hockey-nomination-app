import Image from "next/image";
import Link from "next/link";
import { SitePageHero } from "@/components/site/SitePageHero";

export function KdoJsemContent() {
  return (
    <main className="pb-16 pt-2 sm:pb-20">
      <SitePageHero
        title="Kdo jsem"
        subtitle="Za projektem Lineup stojím jako fanoušek — tady je stručně kontext a odkaz zpět na úvod."
      />
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="sestava-premium-panel-dark rounded-2xl p-5 shadow-[0_24px_64px_rgba(0,0,0,0.35)] sm:p-7">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
            <figure className="mx-auto shrink-0 sm:mx-0 w-full max-w-[280px] sm:max-w-[300px]">
              <Image
                src="/images/kdo-jsem-autor.png"
                alt="Autor projektu Lineup ve fanouškovském dresu české reprezentace"
                width={600}
                height={900}
                priority
                className="w-full rounded-2xl border border-white/[0.08] bg-black object-cover shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
                sizes="(max-width:640px) 85vw, 300px"
              />
            </figure>
            <div className="min-w-0 flex-1 space-y-6 text-sm leading-relaxed text-white/82">
              <p>
                Jsem fanoušek českého hokeje a tuhle hru stavím jako{" "}
                <strong className="text-white">projekt pro komunitu</strong>: transparentně, bez zbytečného balastu, s respektem
                k oficiálním materiálům reprezentace.
              </p>
              <p>
                Editor sestavy a soutěž jsou <strong className="text-white">nezávislé na ČSLH</strong> — jde o fanouškovskou
                zábavu a srovnání tipů s reálnou nominací a zápisem z utkání.
              </p>
            </div>
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
