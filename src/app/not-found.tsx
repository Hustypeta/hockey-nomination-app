import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Stránka nenalezena",
  description: "Tato stránka na Lineupu neexistuje. Vrať se na úvod, editor sestavy nebo soutěže.",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/", label: "Úvod" },
  { href: "/sestava", label: "Editor nominace" },
  { href: "/zapasy/sestava", label: "Editor sestavy" },
  { href: "/souteze", label: "Soutěže" },
  { href: "/forum", label: "Fórum" },
] as const;

export default function NotFound() {
  return (
    <SiteShell>
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/50">404</p>
        <h1 className="font-display mt-2 text-3xl font-black text-white sm:text-4xl">
          Stránka se nenašla
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
          Tahle adresa na hokejlineup.cz neexistuje, nebo se přesunula. Zkus úvod, editor sestavy
          nebo soutěže.
        </p>
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Kam dál">
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white/85 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </main>
    </SiteShell>
  );
}
