"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ClipboardList, Loader2, Sparkles } from "lucide-react";

export type NominationListItem = {
  id: string;
  createdAt: string;
  timeBonusPercent: number;
  captainId: string | null;
};

export function UserAccountHub() {
  const { data: session, status } = useSession();
  const [nominations, setNominations] = useState<NominationListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetch("/api/nominations")
      .then((r) => {
        if (r.status === 401) return { nominations: [] as NominationListItem[] };
        if (!r.ok) throw new Error("fetch");
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setNominations(d.nominations ?? []);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Nepodařilo se načíst nominace.");
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#c8102e]" aria-hidden />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-sans text-2xl font-bold text-white">Můj účet</h1>
        <p className="mt-3 text-slate-400">
          Pro přehled nominací a účasti v soutěži se přihlas přes Google.
        </p>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/ucet" })}
          className="mt-8 rounded-xl bg-gradient-to-r from-[#c8102e] to-[#9e0c24] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[#c8102e]/25 transition hover:brightness-110"
        >
          Přihlásit se přes Google
        </button>
        <p className="mt-6 text-sm text-slate-500">
          <Link href="/sestava" className="text-sky-300/90 underline-offset-2 hover:underline">
            Editor sestavy
          </Link>{" "}
          můžeš zkoušet i bez účtu — uložení do soutěže vyžaduje přihlášení.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="font-sans text-2xl font-bold text-white sm:text-3xl">Můj účet</h1>
      {session?.user?.email ? (
        <p className="mt-1 text-sm text-slate-400">{session.user.email}</p>
      ) : null}

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/sestava"
          className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#c8102e]/45 bg-gradient-to-br from-[#c8102e]/25 via-[#0f172a]/90 to-[#05080f]/95 px-6 py-10 text-center shadow-[0_0_40px_rgba(200,16,46,0.15)] transition hover:border-[#f1c40f]/45 hover:shadow-[0_0_48px_rgba(200,16,46,0.25)]"
        >
          <Sparkles className="h-9 w-9 text-[#f1c40f] transition group-hover:scale-105" aria-hidden />
          <span className="text-lg font-bold text-white">Nová nominace</span>
          <span className="max-w-[14rem] text-xs font-normal leading-snug text-slate-400">
            Editor soupisky — uložení do soutěže a sdílení
          </span>
        </Link>

        <a
          href="#moje-nominace"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/12 bg-[#0f172a]/85 px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-[#003087]/45 hover:bg-[#0f172a]"
        >
          <ClipboardList className="h-9 w-9 text-sky-300" aria-hidden />
          <span className="text-lg font-bold text-white">Moje nominace</span>
          <span className="max-w-[14rem] text-xs font-normal leading-snug text-slate-400">
            Uložené sestavy u tvého účtu
          </span>
        </a>
      </div>

      <section id="moje-nominace" className="mt-14 scroll-mt-28">
        <h2 className="font-sans text-xl font-bold text-white">Uložené nominace</h2>
        <p className="mt-1 text-sm text-slate-500">
          Každé uložení vytvoří nový záznam v soutěži (podle pravidel včetně uzávěrky).
        </p>

        {loadError ? (
          <p className="mt-4 text-sm text-rose-300">{loadError}</p>
        ) : null}
        {nominations === null && !loadError ? (
          <p className="mt-6 text-slate-500">Načítám…</p>
        ) : null}
        {nominations && nominations.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-8 text-center text-slate-400">
            Zatím nemáš uloženou nominaci. Zvol <strong className="text-white">Nová nominace</strong>, poskládej
            sestavu a po dokončení ji ulož v editoru (tlačítko dole).
          </p>
        ) : null}
        {nominations && nominations.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {nominations.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/nominations/${n.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0a1428]/90 px-4 py-4 transition hover:border-[#c8102e]/35"
                >
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-medium text-white">
                      {new Date(n.createdAt).toLocaleString("cs-CZ", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-slate-500">{n.id}</p>
                    {n.timeBonusPercent > 0 ? (
                      <p className="mt-1 text-xs text-amber-200/90">Časový bonus +{n.timeBonusPercent} % k bodům</p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">Bez časového bonusu</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-[#f1c40f]">Otevřít →</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
