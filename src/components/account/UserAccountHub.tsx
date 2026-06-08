"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { ClipboardList, Sparkles, Star, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserContestStandingCard } from "@/components/contest/UserContestStandingCard";
import { UserFantasyStandingCard } from "@/components/fantasy/UserFantasyStandingCard";

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
  const [nickname, setNickname] = useState("");
  const [loadedNickname, setLoadedNickname] = useState(false);
  const [savingNick, setSavingNick] = useState(false);
  const [effectiveDisplayName, setEffectiveDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || loadedNickname) return;
    fetch("/api/account/leaderboard-nickname")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((d: { nickname?: unknown; displayName?: unknown }) => {
        const n = typeof d.nickname === "string" ? d.nickname : "";
        setNickname(n);
        setLoadedNickname(true);
        setEffectiveDisplayName(typeof d.displayName === "string" ? d.displayName : null);
      })
      .catch(() => {
        setLoadedNickname(true);
      });
  }, [status, loadedNickname]);

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
            Editor nominace
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

      <UserFantasyStandingCard />
      <UserContestStandingCard />

      <div className="mt-8 rounded-2xl border border-white/12 bg-[#0f172a]/85 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Veřejný žebříček</p>
        <h2 className="mt-1 font-display text-lg font-black text-white">Zobrazované jméno</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          Veřejně nezobrazujeme e‑mail ani jméno. V žebříčku se ukáže tvoje přezdívka — nebo automaticky{" "}
          <span className="font-semibold text-white">Hráč #XXXX</span>.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block text-xs font-semibold text-white/70">
            Přezdívka (2–24 znaků)
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="např. PetrH"
              maxLength={24}
              className="mt-2 w-full rounded-xl border border-white/14 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#00B4FF]/45 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/15"
              autoComplete="off"
            />
          </label>
          <button
            type="button"
            disabled={savingNick}
            onClick={() => {
              if (savingNick) return;
              setSavingNick(true);
              fetch("/api/account/leaderboard-nickname", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nickname }),
              })
                .then(async (r) => {
                  const d = (await r.json().catch(() => ({}))) as { error?: unknown; displayName?: unknown; nickname?: unknown };
                  if (!r.ok) throw new Error(typeof d.error === "string" ? d.error : "Uložení se nepovedlo.");
                  setEffectiveDisplayName(typeof d.displayName === "string" ? d.displayName : null);
                  setNickname(typeof d.nickname === "string" ? d.nickname : "");
                  toast.success("Přezdívka uložena.");
                })
                .catch((e: unknown) => {
                  toast.error(e instanceof Error ? e.message : "Uložení se nepovedlo.");
                })
                .finally(() => setSavingNick(false));
            }}
            className="rounded-xl bg-gradient-to-r from-[#0090cc] to-[#00B4FF] px-5 py-3 text-sm font-black text-[#03050a] shadow-[0_0_24px_rgba(0,180,255,0.26)] ring-1 ring-white/15 disabled:opacity-50"
          >
            {savingNick ? "Ukládám…" : "Uložit"}
          </button>
        </div>

        {effectiveDisplayName ? (
          <p className="mt-3 text-xs text-white/55">
            Aktuálně v žebříčku: <span className="font-semibold text-white">{effectiveDisplayName}</span>
          </p>
        ) : null}
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

        <Link
          href="/ucet/pickem"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/12 bg-[#0f172a]/85 px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-[#f1c40f]/35 hover:bg-[#0f172a]"
        >
          <Trophy className="h-9 w-9 text-[#f1c40f]/90" aria-hidden />
          <span className="text-lg font-bold text-white">Koncepty Pick’em</span>
          <span className="max-w-[14rem] text-xs font-normal leading-snug text-slate-400">
            Uložené tipy pavouka u tvého účtu
          </span>
        </Link>

        <Link
          href="/ucet/zapasove-sestavy"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/12 bg-[#0f172a]/85 px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-[#c8102e]/35 hover:bg-[#0f172a]"
        >
          <Users className="h-9 w-9 text-[#c8102e]/90" aria-hidden />
          <span className="text-lg font-bold text-white">Zápasové sestavy</span>
          <span className="max-w-[14rem] text-xs font-normal leading-snug text-slate-400">
            Uložené odkazy na sestavy na zápas
          </span>
        </Link>

        <Link
          href="/ucet/hodnoceni"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/12 bg-[#0f172a]/85 px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-emerald-400/35 hover:bg-[#0f172a]"
        >
          <Star className="h-9 w-9 text-emerald-300/90" aria-hidden />
          <span className="text-lg font-bold text-white">Hodnocení hráčů</span>
          <span className="max-w-[14rem] text-xs font-normal leading-snug text-slate-400">
            Tvoje známky hráčů v jednotlivých zápasech
          </span>
        </Link>

      </div>
    </div>
  );
}
