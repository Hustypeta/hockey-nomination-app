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
import {
  DEV_GOOGLE_OAUTH_REDIRECT_URI,
  SITE_CANONICAL_HOST,
  SITE_GOOGLE_OAUTH_REDIRECT_URI,
} from "@/lib/siteBranding";

function errorExplanation(code: string | null): string | null {
  if (!code) return null;
  const map: Record<string, string> = {
    OAuthAccountNotLinked:
      "Tento Google účet nelze automaticky propojit s účtem, který už ve službě existuje (kolize e-mailu / účtu). Zkus jiný Google účet nebo dej vědět správci — případně zkontroluj databázi uživatelů.",
    OAuthCallback:
      "Google nevrátil platný token (redirect uri mismatch = špatná adresa v Google Cloud Console nebo jiné NEXTAUTH_URL než očekáváš). V Google Cloud Console → API a služby → Pověření → tvůj OAuth 2.0 Client ID (typ Web) v sekci „Autorizované přesměrovací identifikátory URI“ musí být přesně: " +
      SITE_GOOGLE_OAUTH_REDIRECT_URI +
      " (a na hostingu / Railway proměnná NEXTAUTH_URL=https://" +
      SITE_CANONICAL_HOST +
      " bez www a bez lomítka na konci). Pro vývoj v Cursoru/localhost ještě: " +
      DEV_GOOGLE_OAUTH_REDIRECT_URI +
      ". V sekci „Autorizované domény JavaScriptu“ přidej https://" +
      SITE_CANONICAL_HOST +
      " a pro lokál http://localhost:3000. Zkontroluj taky GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (stejný projekt v Google).",
    OAuthSignin: "Chyba při startu OAuth u poskytovatele.",
    Callback: "Chyba při dokončení přihlášení na serveru (často databáze nebo konfigurace). Mrkni do logů nasazení.",
    Configuration: "Chyba konfigurace NextAuth (např. chybí NEXTAUTH_SECRET v produkci).",
    AccessDenied: "Přihlášení bylo zamítnuto.",
    Verification: "Neplatný nebo expirovaný ověřovací odkaz.",
    SessionRequired: "Vyžadována session.",
    Default: "Neznámá chyba přihlášení.",
  };
  return map[code] ?? `Kód chyby: ${code}. Zkus to znovu nebo kontaktuj podporu.`;
}

function SignInBody() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl = useMemo(() => {
    if (!rawCallback) return "/sestava";
    try {
      const u = new URL(rawCallback, typeof window !== "undefined" ? window.location.origin : "https://hokejlineup.cz");
      if (u.pathname.startsWith("/")) return `${u.pathname}${u.search}`;
    } catch {
      /* ignore */
    }
    return rawCallback.startsWith("/") ? rawCallback : "/sestava";
  }, [rawCallback]);

  const hint = errorExplanation(errorCode);

  return (
    <SiteShell>
      <FifaAppPage fitViewport={false}>
        <div className="mx-auto w-full max-w-lg">
          <FifaPageHeader title="Přihlášení" subtitle="Google účet" align="center" />
          {hint ? (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm leading-relaxed text-red-100/95"
            >
              <p className="font-semibold text-red-100">Přihlášení se nepovedlo</p>
              <p className="mt-2 text-red-100/90">{hint}</p>
              {errorCode ? (
                <p className="mt-2 font-mono text-xs text-red-200/70">
                  Technický kód: <span className="select-all">{errorCode}</span>
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
              Po kliknutí otevře Google výběr účtu (kvůli bezpečnosti máme zapnutý výběr účtu při každém pokusu).
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
