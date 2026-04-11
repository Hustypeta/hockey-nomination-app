import Link from "next/link";
import { UserRound } from "lucide-react";

/** Stručné „okénko“ na úvodní stránce — plný profil je na /kdo-jsem. */
export function AuthorBriefTeaser() {
  return (
    <aside
      className="mx-auto mt-10 max-w-xl rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#0c1528]/95 to-[#080d14]/95 p-5 shadow-[0_0_40px_rgba(0,48,135,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] sm:mt-12 sm:p-6"
      aria-labelledby="author-teaser-heading"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#003087]/30 text-sky-200 ring-1 ring-[#003087]/40"
          aria-hidden
        >
          <UserRound className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            id="author-teaser-heading"
            className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white/90"
          >
            Kdo za tím stojí
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Vždycky mě bavilo sledovat české hokejisty a v hlavě si skládat nominace na hokejové turnaje. Tímhle
            projektem chci svoji zálibu rozšířit i mezi další hokejové nadšence, kterých je podle mého v naší
            hokejové zemičce nespočítaně. Ne nadarmo se totiž říká: „Co Čech, to hokejový trenér.“ Pojď se přidat
            a pomoz mi vybudovat komunitu lidí, kteří hokejem žijí stejně jako já. Víc o mně a o projektu na
            stránce{" "}
            <Link href="/kdo-jsem" className="font-medium text-cyan-300/95 underline-offset-2 hover:underline">
              Kdo jsem
            </Link>
            .
          </p>
        </div>
      </div>
    </aside>
  );
}
