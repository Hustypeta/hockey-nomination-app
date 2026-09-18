import Link from "next/link";

export function HomeSeoIntro() {
  return (
    <section
      className="fifa-home-seo-intro rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left sm:px-5"
      aria-labelledby="home-seo-intro-title"
    >
      <h2
        id="home-seo-intro-title"
        className="font-display text-sm font-bold tracking-tight text-white sm:text-base"
      >
        Hokejový editor sestavy pro fanoušky
      </h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-white/70 sm:text-sm">
        Lineup je fanouškovská platforma, kde si poskládáš{" "}
        <Link href="/sestava" className="text-cyan-200/90 underline-offset-2 hover:underline">
          nominaci české reprezentace
        </Link>
        , uložíš{" "}
        <Link href="/zapasy/sestava" className="text-cyan-200/90 underline-offset-2 hover:underline">
          sestavu na zápas
        </Link>{" "}
        a zapojíš se do soutěží kolem{" "}
        <Link href="/souteze/extraliga" className="text-cyan-200/90 underline-offset-2 hover:underline">
          extraligy 2026/27
        </Link>{" "}
        a{" "}
        <Link href="/souteze/historical-lineup" className="text-cyan-200/90 underline-offset-2 hover:underline">
          historických sestav
        </Link>
        . Prohlížet editor můžeš bez účtu — Google přihlášení až když chceš sestavu uložit. Přečti si{" "}
        <Link href="/clanky" className="text-cyan-200/90 underline-offset-2 hover:underline">
          články
        </Link>
        , koukni na{" "}
        <Link href="/forum" className="text-cyan-200/90 underline-offset-2 hover:underline">
          fórum
        </Link>{" "}
        nebo si ověř{" "}
        <Link href="/pravidla-souteze" className="text-cyan-200/90 underline-offset-2 hover:underline">
          pravidla soutěže
        </Link>
        .
      </p>
    </section>
  );
}
