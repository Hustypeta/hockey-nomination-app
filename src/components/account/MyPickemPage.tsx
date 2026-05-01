"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { encodeBracketPayload } from "@/lib/bracketPayload";
import type { BracketPickemPayload } from "@/types/bracketPickem";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MyPickemPage() {
  const { status } = useSession();
  const [payload, setPayload] = useState<BracketPickemPayload | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    setLoadError(null);
    fetch("/api/pickem/me")
      .then((r) => {
        if (r.status === 401) return { ok: true, payload: null as BracketPickemPayload | null };
        if (!r.ok) throw new Error("fetch");
        return r.json();
      })
      .then((d: { payload?: unknown; updatedAt?: string }) => {
        const p = d.payload;
        if (p && typeof p === "object") setPayload(p as BracketPickemPayload);
        else setPayload(null);
        setUpdatedAt(typeof d.updatedAt === "string" ? d.updatedAt : null);
      })
      .catch(() => setLoadError("Nepodařilo se načíst Pick’em koncept."))
      .finally(() => setLoading(false));
  }, [status]);

  const openUrl = useMemo(() => {
    if (!payload) return "/bracket";
    return `/bracket?z=${encodeBracketPayload(payload)}`;
  }, [payload]);

  if (status === "loading") {
    return <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Načítám…</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-sans text-2xl font-bold text-white">Koncepty Pick’em</h1>
        <p className="mt-3 text-slate-400">
          Pro uložení a otevření Pick’emu z účtu se přihlas přes Google.
        </p>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/ucet/pickem" })}
          className="mt-8 rounded-xl bg-gradient-to-r from-[#003087] to-[#002056] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[#003087]/25 transition hover:brightness-110"
        >
          Přihlásit se přes Google
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-sans text-2xl font-bold text-white sm:text-3xl">Koncepty Pick’em</h1>
          <p className="mt-2 text-sm text-slate-400">
            Pick’em můžeš tipovat i bez účtu, ale uložit koncept / odeslat do soutěže jde jen po přihlášení.
          </p>
        </div>
        <Link
          href="/bracket"
          className="shrink-0 rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/[0.1]"
        >
          Otevřít Pick’em
        </Link>
      </div>

      <div className="mt-10 rounded-2xl border border-white/12 bg-[#0f172a]/85 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {loading ? (
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Načítám…
          </div>
        ) : loadError ? (
          <p className="text-sm text-amber-200">{loadError}</p>
        ) : payload ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Uložený koncept</p>
              {updatedAt ? <p className="mt-1 text-xs text-slate-400">Upraveno: {formatWhen(updatedAt)}</p> : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={openUrl}
                className="inline-flex items-center justify-center rounded-xl bg-[#f1c40f] px-4 py-2.5 text-sm font-black text-slate-900 hover:brightness-105"
              >
                Otevřít v Pick’emu
              </Link>
              <Link
                href="/bracket?loadAccount=1"
                className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/[0.1]"
              >
                Načíst z účtu
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-white/75">Zatím nemáš uložený Pick’em koncept.</p>
            <p className="mt-2 text-xs text-slate-400">Otevři Pick’em a klikni na “Uložit koncept”.</p>
            <Link
              href="/bracket"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#003087] via-[#002a5c] to-[#c8102e] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_40px_rgba(0,48,135,0.35),0_0_32px_rgba(200,16,46,0.15)] transition hover:brightness-110"
            >
              Jít do Pick’emu
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

