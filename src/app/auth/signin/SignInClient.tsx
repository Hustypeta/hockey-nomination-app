"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { FifaPageHeader } from "@/components/fifa/FifaPageHeader";
import { FIFA_LINK, FIFA_META } from "@/lib/fifa/fifaUiClasses";
import { LINEUP_EDITOR_PATH } from "@/lib/matchSharePool";
import {
  DEV_GOOGLE_OAUTH_REDIRECT_URI,
  SITE_CANONICAL_HOST,
  SITE_GOOGLE_OAUTH_REDIRECT_URI,
} from "@/lib/siteBranding";

const PUBLIC_FAIL = "Nepovedlo se, zkus to znovu.";

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

/** Stručná zpráva pro návštěvníky — bez návodu na Google Cloud / env. */
function publicErrorMessage(code: string | null): string {
  if (!code) return PUBLIC_FAIL;
  if (code === "AccessDenied") return "Přihlášení bylo zrušeno. Můžeš to zkusit znovu.";
  if (code === "OAuthAccountNotLinked") {
    return "Tenhle Google účet nejde propojit s účtem, který už tady je. Zkus jiný Google účet.";
  }
  return PUBLIC_FAIL;
}

/** Detail jen na localhost — pro tebe při ladění OAuth. */
function localDevErrorDetail(code: string): string | null {
  const map: Record<string, string> = {
    OAuthAccountNotLinked:
      "Kolize e-mailu / účtu v DB — Google účet nejde auto-linknout. Zkontroluj User + Account v databázi.",
    OAuthCallback:
      "Redirect URI mismatch nebo špatné NEXTAUTH_URL. V Google Cloud Console → OAuth 2.0 Client musí být přesně: " +
      SITE_GOOGLE_OAUTH_REDIRECT_URI +
      " a lokálně: " +
      DEV_GOOGLE_OAUTH_REDIRECT_URI +
      ". Railway: NEXTAUTH_URL=https://" +
      SITE_CANONICAL_HOST +
      " (bez www, bez lomítka). Zkontroluj GOOGLE_CLIENT_ID / SECRET.",
    OAuthSignin: "Chyba při startu OAuth u Googlu.",
    Callback: "Chyba callbacku na serveru (DB / konfigurace) — mrkni do logů.",
    Configuration: "Chybí NEXTAUTH_SECRET nebo jiná konfigurace NextAuth.",
    AccessDenied: "AccessDenied od poskytovatele.",
    Verification: "Neplatný / expirovaný ověřovací odkaz.",
    SessionRequired: "SessionRequired.",
    Default: "Neznámá chyba NextAuth.",
  };
  return map[code] ?? `Kód: ${code}`;
}

function SignInBody() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl = useMemo(() => {
    if (!rawCallback) return LINEUP_EDITOR_PATH;
    try {
      const u = new URL(
        rawCallback,
        typeof window !== "undefined" ? window.location.origin : "https://hokejlineup.cz",
      );
      if (u.pathname.startsWith("/")) return `${u.pathname}${u.search}`;
    } catch {
      /* ignore */
    }
    return rawCallback.startsWith("/") ? rawCallback : LINEUP_EDITOR_PATH;
  }, [rawCallback]);

  const showDevDetail = isLocalDevHost() && Boolean(errorCode);
  const publicHint = errorCode ? publicErrorMessage(errorCode) : null;
  const devDetail = showDevDetail && errorCode ? localDevErrorDetail(errorCode) : null;

  return (
    <SiteShell>
      <FifaAppPage fitViewport={false}>
        <div className="mx-auto w-full max-w-lg">
          <FifaPageHeader title="Přihlášení" subtitle="Google účet" align="center" />
          {publicHint ? (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm leading-relaxed text-red-100/95"
            >
              <p className="font-semibold text-red-100">Přihlášení se nepovedlo</p>
              <p className="mt-2 text-red-100/90">{publicHint}</p>
              {devDetail ? (
                <p className="mt-3 border-t border-red-500/25 pt-3 font-mono text-xs leading-relaxed text-red-200/75">
                  {devDetail}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="fifa-panel rounded-2xl p-6">
            <button
              type="button"
              onClick={() => void signIn("google", { callbackUrl })}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--fifa-border)] bg-[var(--fifa-bg-surface)] px-4 py-3.5 text-sm font-semibold text-[var(--fifa-text)] transition hover:bg-[var(--fifa-bg-hover)]"
            >
              <LogIn className="h-5 w-5 shrink-0 text-[var(--fifa-text-secondary)]" aria-hidden />
              Pokračovat s Google
            </button>
            <p className={`${FIFA_META} mt-4 text-center`}>
              Po kliknutí otevře Google výběr účtu.
            </p>
          </div>

          <p className={`${FIFA_META} mt-8 text-center`}>
            <Link href="/" className={FIFA_LINK}>
              Zpět na úvod
            </Link>
          </p>
        </div>
      </FifaAppPage>
    </SiteShell>
  );
}

export function SignInClient() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <FifaAppPage fitViewport={false}>
            <div className="py-24 text-center text-sm text-[var(--fifa-text-muted)]">Načítám…</div>
          </FifaAppPage>
        </SiteShell>
      }
    >
      <SignInBody />
    </Suspense>
  );
}
