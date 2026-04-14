"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { ClipboardList, Sparkles } from "lucide-react";

export type NominationListItem = {
  id: string;
  createdAt: string;
  timeBonusPercent: number;
  captainId: string | null;
  title: string | null;
  /** Řádek odeslaný jednorázově do soutěže. */
  isContestEntry?: boolean;
};

export function UserAccountHub() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Načítám…</div>
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-sans text-2xl font-bold text-white sm:text-3xl">Můj účet</h1>
          {session?.user?.email ? (
            <p className="mt-1 text-sm text-slate-400">{session.user.email}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="shrink-0 rounded-lg border border-white/12 bg-black/20 px-4 py-2 text-sm font-medium text-white/85 shadow-sm transition hover:border-[#c8102e]/40 hover:bg-[#c8102e]/10"
        >
          Odhlásit
        </button>
      </div>

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

        <Link
          href="/ucet/nominace"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/12 bg-[#0f172a]/85 px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-[#003087]/45 hover:bg-[#0f172a]"
        >
          <ClipboardList className="h-9 w-9 text-sky-300" aria-hidden />
          <span className="text-lg font-bold text-white">Moje nominace</span>
          <span className="max-w-[14rem] text-xs font-normal leading-snug text-slate-400">
            Uložené sestavy u tvého účtu
          </span>
        </Link>
      </div>
    </div>
  );
}
