"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { ClipboardList, Sparkles, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserContestStandingCard } from "@/components/contest/UserContestStandingCard";
import { UserFantasyStandingCard } from "@/components/fantasy/UserFantasyStandingCard";
import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import {
  FIFA_BTN_PRIMARY,
  FIFA_BTN_SECONDARY,
  FIFA_CARD_LINK,
  FIFA_INPUT,
  FIFA_KICKER,
  FIFA_LINK,
} from "@/lib/fifa/fifaUiClasses";

export type NominationListItem = {
  id: string;
  createdAt: string;
  timeBonusPercent: number;
  captainId: string | null;
  title: string | null;
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

  const hasCustomLeaderboardNickname = loadedNickname && nickname.trim().length >= 2;

  if (status === "loading") {
    return (
      <FifaAppPage>
        <div className="flex h-full min-h-0 flex-1 items-center justify-center text-[var(--fifa-text-muted)]">Načítám…</div>
      </FifaAppPage>
    );
  }

  if (status === "unauthenticated") {
    return (
      <FifaAppPage>
        <div className="mx-auto flex h-full min-h-0 max-w-lg flex-col items-center justify-center px-2 text-center">
          <p className={FIFA_KICKER}>Účet</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-[var(--fifa-text)]">Můj účet</h1>
          <p className="mt-3 text-sm text-[var(--fifa-text-secondary)]">
            Pro přehled nominací a účasti v soutěži se přihlas přes Google.
          </p>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/ucet" })}
            className={`mt-8 ${FIFA_BTN_PRIMARY}`}
          >
            Přihlásit se přes Google
          </button>
          <p className="mt-6 text-sm text-[var(--fifa-text-muted)]">
            <Link href="/sestava" className={FIFA_LINK}>
              Editor nominace
            </Link>{" "}
            můžeš zkoušet i bez účtu — uložení do soutěže vyžaduje přihlášení.
          </p>
        </div>
      </FifaAppPage>
    );
  }

  return (
    <FifaAppPage className="!py-2 lg:!py-2.5">
      <div className="fifa-viewport-page">
        <div className="fifa-page-heading fifa-viewport-page-header flex shrink-0 flex-wrap items-end justify-between gap-2">
          <div className="min-w-0">
            <p className={FIFA_KICKER}>Můj účet</p>
            <h1>Přehled</h1>
            {session?.user?.email ? <p>{session.user.email}</p> : null}
          </div>
          <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className={FIFA_BTN_SECONDARY}>
            Odhlásit
          </button>
        </div>

        <div className="fifa-viewport-page-body fifa-viewport-page-body--scroll-mobile mt-2 min-h-0 flex-1">
          <div className="fifa-panel-scroll min-h-0 flex-1 pr-0.5">
      <UserContestStandingCard />

      <UserFantasyStandingCard />

      {!hasCustomLeaderboardNickname ? (
        <div className="fifa-panel mt-4 rounded-2xl p-4 lg:mt-5 lg:p-5">
          <p className={FIFA_KICKER}>Veřejný žebříček</p>
          <h2 className="mt-1 font-display text-xl text-[var(--fifa-text)]">Zobrazované jméno</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--fifa-text-secondary)]">
            Veřejně nezobrazujeme e‑mail ani jméno. V žebříčku se ukáže tvoje přezdívka — nebo automaticky{" "}
            <span className="font-semibold text-[var(--fifa-text)]">Hráč #XXXX</span>.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block text-xs font-semibold text-[var(--fifa-text-secondary)]">
              Přezdívka (2–24 znaků)
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="např. PetrH"
                maxLength={24}
                className={`mt-2 ${FIFA_INPUT}`}
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
                    const d = (await r.json().catch(() => ({}))) as {
                      error?: unknown;
                      displayName?: unknown;
                      nickname?: unknown;
                    };
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
              className={FIFA_BTN_PRIMARY}
            >
              {savingNick ? "Ukládám…" : "Uložit"}
            </button>
          </div>

          {effectiveDisplayName ? (
            <p className="fifa-meta mt-3">
              Aktuálně v žebříčku: <span className="font-semibold text-[var(--fifa-text)]">{effectiveDisplayName}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:gap-3">
        <Link href="/sestava" className={FIFA_CARD_LINK}>
          <Sparkles className="h-9 w-9 text-[var(--fifa-accent-text)]" aria-hidden />
          <span className="font-display text-lg text-[var(--fifa-text)]">Nová nominace</span>
          <span className="max-w-[14rem] text-xs leading-snug text-[var(--fifa-text-secondary)]">
            Editor soupisky — uložení do soutěže a sdílení
          </span>
        </Link>

        <Link href="/ucet/nominace" className={FIFA_CARD_LINK}>
          <ClipboardList className="h-9 w-9 text-[var(--fifa-accent-text)]" aria-hidden />
          <span className="font-display text-lg text-[var(--fifa-text)]">Moje nominace</span>
          <span className="max-w-[14rem] text-xs leading-snug text-[var(--fifa-text-secondary)]">Uložené sestavy u tvého účtu</span>
        </Link>

        <Link href="/ucet/pickem" className={FIFA_CARD_LINK}>
          <Trophy className="h-9 w-9 text-[var(--fifa-accent-text)]" aria-hidden />
          <span className="font-display text-lg text-[var(--fifa-text)]">Koncepty Pick’em</span>
          <span className="max-w-[14rem] text-xs leading-snug text-[var(--fifa-text-secondary)]">Uložené tipy pavouka u tvého účtu</span>
        </Link>

        <Link href="/ucet/zapasove-sestavy" className={FIFA_CARD_LINK}>
          <Users className="h-9 w-9 text-[var(--fifa-accent-text)]" aria-hidden />
          <span className="font-display text-lg text-[var(--fifa-text)]">Zápasové sestavy</span>
          <span className="max-w-[14rem] text-xs leading-snug text-[var(--fifa-text-secondary)]">Uložené odkazy na sestavy na zápas</span>
        </Link>
      </div>
          </div>
        </div>
      </div>
    </FifaAppPage>
  );
}
