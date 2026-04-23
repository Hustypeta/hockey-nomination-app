import { UserRound } from "lucide-react";

/** Stručné „okénko“ na úvodní stránce. */
export function AuthorBriefTeaser() {
  return (
    <aside
      className="mx-auto mt-10 max-w-xl rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#0c1528]/95 to-[#080d14]/95 p-5 shadow-[0_0_40px_rgba(0,48,135,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] sm:mt-12 sm:p-6"
      aria-labelledby="author-teaser-heading"
    >
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/15 sm:h-20 sm:w-20">
          {/* eslint-disable-next-line @next/next/no-img-element -- veřejný statický asset z /public */}
          <img
            src="/images/kdo-jsem-autor.png"
            alt=""
            width={160}
            height={160}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent"
            aria-hidden
          />
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
            a pomoz mi vybudovat komunitu lidí, kteří hokejem žijí stejně jako já. Víc o projektu a o mně brzy
            doplníme.
          </p>
        </div>
      </div>
    </aside>
  );
}
