"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import { Images, Loader2, Plus, Share2 } from "lucide-react";
import { MatchLineupImageExportButton } from "@/components/match/MatchLineupImageExportButton";
import type { LineupStructure, Player } from "@/types";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { initJerseyNameDisambiguation } from "@/lib/jerseyDisplayName";

type MatchShareLinkRow = {
  code: string;
  slug: string | null;
  title: string | null;
  createdAt: string;
  defenseCount: number;
  allowExtraForward: boolean;
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function shareLink(title: string, url: string) {
  const nav = typeof navigator !== "undefined" ? navigator : null;
  if (nav && typeof nav.share === "function") {
    try {
      await nav.share({ title, text: title, url });
      return;
    } catch {
      /** uživatel zrušil — fallne na clipboard. */
    }
  }
  try {
    await nav?.clipboard?.writeText(url);
    toast.success("Odkaz zkopírován do schránky.");
  } catch {
    toast.error("Nepodařilo se zkopírovat odkaz.");
  }
}

type PosterBundle = {
  code: string;
  title: string;
  slug: string | null;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  lineup: LineupStructure;
  players: Player[];
  siteOrigin: string;
};

export function MyMatchLineupsPage() {
  const { status } = useSession();
  const [links, setLinks] = useState<MatchShareLinkRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [poster, setPoster] = useState<PosterBundle | null>(null);
  const [posterLoadingCode, setPosterLoadingCode] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetch("/api/account/match-share-links")
      .then((r) => {
        if (r.status === 401) return { links: [] as MatchShareLinkRow[] };
        if (!r.ok) throw new Error("fetch");
        return r.json();
      })
      .then((d: { links?: MatchShareLinkRow[] }) => {
        if (!cancelled) setLinks(d.links ?? []);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Nepodařilo se načíst zápasové sestavy.");
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  const empty = useMemo(() => Array.isArray(links) && links.length === 0, [links]);

  async function openPosterGenerator(row: MatchShareLinkRow) {
    setPosterLoadingCode(row.code);
    try {
      const [rp, rl] = await Promise.all([
        fetch("/api/players"),
        fetch(`/api/match-share-links/${encodeURIComponent(row.code)}`),
      ]);
      if (!rp.ok) {
        toast.error("Nepodařilo se načíst hráče pro plakát.");
        return;
      }
      if (!rl.ok) {
        const err = (await rl.json().catch(() => ({}))) as { error?: string };
        toast.error(typeof err.error === "string" ? err.error : "Nepodařilo se načíst sestavu.");
        return;
      }
      const players = (await rp.json()) as Player[];
      const data = (await rl.json()) as {
        lineupStructure?: unknown;
        defenseCount?: number;
        allowExtraForward?: boolean;
        title?: string | null;
        slug?: string | null;
      };
      if (!data.lineupStructure || typeof data.lineupStructure !== "object") {
        toast.error("V uložené sestavě chybí data soupisky.");
        return;
      }
      const dcRaw = data.defenseCount ?? row.defenseCount;
      const defenseCount: 6 | 7 | 8 =
        dcRaw === 6 || dcRaw === 7 || dcRaw === 8 ? dcRaw : row.defenseCount === 6 || row.defenseCount === 7
          ? row.defenseCount
          : 8;
      const allowExtraForward = Boolean(
        typeof data.allowExtraForward === "boolean" ? data.allowExtraForward : row.allowExtraForward
      );
      const lineup = normalizeLineupStructure(data.lineupStructure as LineupStructure, { mode: "match" });
      initJerseyNameDisambiguation(players);
      const title =
        (typeof data.title === "string" && data.title.trim()) || row.title?.trim() || "Sestava na zápas";
      const slug = typeof data.slug === "string" && data.slug.length > 0 ? data.slug : row.slug ?? null;
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setPoster({
        code: row.code,
        title,
        slug,
        defenseCount,
        allowExtraForward,
        lineup,
        players,
        siteOrigin: origin,
      });
    } catch {
      toast.error("Plakát se nepodařilo připravit.");
    } finally {
      setPosterLoadingCode(null);
    }
  }

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
        <h1 className="font-sans text-2xl font-bold text-white">Zápasové sestavy</h1>
        <p className="mt-3 text-slate-400">Pro zobrazení uložených zápasových sestav se přihlas.</p>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/ucet/zapasove-sestavy" })}
          className="mt-8 rounded-xl bg-gradient-to-r from-[#c8102e] to-[#9e0c24] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[#c8102e]/25 transition hover:brightness-110"
        >
          Přihlásit se přes Google
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <div>
          <Link href="/ucet" className="text-sky-300/90 hover:underline">
            Můj účet
          </Link>
          <span className="mx-2 text-slate-600">/</span>
          <span className="text-slate-400">Zápasové sestavy</span>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg border border-white/12 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/85 transition hover:border-[#c8102e]/40 hover:bg-[#c8102e]/10 sm:text-sm"
        >
          Odhlásit
        </button>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-sans text-2xl font-bold text-white sm:text-3xl">Zápasové sestavy</h1>
          <p className="mt-1 text-sm text-slate-500">Uložené odkazy z editoru sestavy na zápas.</p>
        </div>
        <Link
          href="/zapasy/sestava"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003087] to-[#00B4FF] px-4 py-2 text-sm font-black text-[#03050a] shadow-[0_0_24px_rgba(0,180,255,0.22)] ring-1 ring-white/15 hover:brightness-110"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nová sestava
        </Link>
      </div>

      {loadError ? <p className="mt-4 text-sm text-rose-300">{loadError}</p> : null}
      {links === null && !loadError ? (
        <p className="mt-10 flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#c8102e]" aria-hidden />
          Načítám…
        </p>
      ) : null}

      {empty ? (
        <p className="mt-8 rounded-2xl border border-white/10 bg-black/25 p-8 text-center text-slate-400">
          Zatím nemáš uloženou žádnou zápasovou sestavu. Otevři{" "}
          <strong className="text-white">Editor sestavy</strong>, slož ji a dej <strong className="text-white">Uložit</strong>.
        </p>
      ) : null}

      {Array.isArray(links) && links.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {links.map((l) => (
            <li key={l.code} className="rounded-xl border border-white/10 bg-[#0a1428]/90 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{l.title?.trim() || "Sestava bez názvu"}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatWhen(l.createdAt)} · {l.defenseCount}D{l.allowExtraForward ? " · 13. útočník" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={posterLoadingCode === l.code}
                    onClick={() => void openPosterGenerator(l)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-violet-400/40 bg-violet-500/15 px-3 py-2 text-sm font-semibold text-violet-100 transition hover:border-violet-300/55 hover:bg-violet-500/25 disabled:opacity-60"
                  >
                    {posterLoadingCode === l.code ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Images className="h-4 w-4" aria-hidden />
                    )}
                    Plakát
                  </button>
                  <Link
                    href={`/zapasy/sestava?kod=${encodeURIComponent(l.code)}`}
                    className="inline-flex items-center justify-center rounded-lg border border-sky-400/40 bg-sky-500/15 px-3 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-300/55 hover:bg-sky-500/25"
                  >
                    Upravit sestavu
                  </Link>
                  {l.slug ? (
                    <>
                      <Link
                        href={`/m/${encodeURIComponent(l.slug)}`}
                        className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#c8102e] to-[#9e0c24] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#c8102e]/20 transition hover:brightness-110"
                      >
                        Otevřít
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const url =
                            typeof window !== "undefined"
                              ? `${window.location.origin}/m/${encodeURIComponent(l.slug!)}`
                              : `/m/${encodeURIComponent(l.slug!)}`;
                          void shareLink(l.title?.trim() || "Sestava na zápas", url);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#f1c40f]/40 bg-gradient-to-b from-[#f1c40f]/15 to-[#f1c40f]/5 px-3 py-2 text-sm font-semibold text-[#f1e6a8] transition hover:from-[#f1c40f]/25 hover:to-[#f1c40f]/10"
                      >
                        <Share2 className="h-4 w-4" aria-hidden />
                        Sdílet
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 font-mono text-[10px] text-slate-600">{l.code}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {poster ? (
        <MatchLineupImageExportButton
          key={poster.code}
          shareTitle={poster.title}
          lineup={poster.lineup}
          players={poster.players}
          defenseCount={poster.defenseCount}
          allowExtraForward={poster.allowExtraForward}
          shareSlug={poster.slug}
          siteOrigin={poster.siteOrigin}
          modalOpen
          onModalOpenChange={(open) => {
            if (!open) setPoster(null);
          }}
          showTriggerButton={false}
        />
      ) : null}
    </div>
  );
}

