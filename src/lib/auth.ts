import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { toCanonicalHokejlineupUrl } from "@/lib/siteBranding";

/**
 * NextAuth `detectOrigin`: pokud je `AUTH_TRUST_HOST` nebo `VERCEL`, origin = protokol + `x-forwarded-host`
 * (ne `NEXTAUTH_URL`). Na Railway můžou být hlavičky u `/api/auth/signin` a `/api/auth/callback` nekonzistentní
 * a pak se liší názvy/konfigurace cookies (`__Secure-…`) → chyba „State cookie was missing“.
 * Proto: máš-li v env nastavené `NEXTAUTH_URL` (doporučeno pro vlastní doménu), **nepoužívej** auto `AUTH_TRUST_HOST`
 * — NextAuth bude vždy brát `process.env.NEXTAUTH_URL` jako origin (stabilní OAuth).
 */
const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT ?? process.env.RAILWAY_PROJECT_ID);
const railwayHost = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
if (onRailway && !process.env.NEXTAUTH_URL?.trim() && railwayHost) {
  const href = /^https?:\/\//i.test(railwayHost) ? railwayHost : `https://${railwayHost}`;
  try {
    const c = toCanonicalHokejlineupUrl(href);
    process.env.NEXTAUTH_URL = c.origin;
  } catch {
    process.env.NEXTAUTH_URL = href;
  }
}

const nextAuthUrlRaw = process.env.NEXTAUTH_URL?.trim();
if (nextAuthUrlRaw) {
  try {
    const c = toCanonicalHokejlineupUrl(nextAuthUrlRaw);
    process.env.NEXTAUTH_URL =
      c.pathname === "/" && !c.search && !c.hash ? c.origin : c.toString();
  } catch {
    /* ponechat původní */
  }
  /* „false“ jako string je pořád truthy — musí zmizet úplně, jinak `detectOrigin` dál bere forwarded host. */
  delete process.env.AUTH_TRUST_HOST;
} else if (onRailway) {
  process.env.AUTH_TRUST_HOST ??= "true";
}

/** NextAuth vyžaduje v produkci tajný klíč (šifrování JWT / cookies). */
function nextAuthSecret(): string | undefined {
  return process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? undefined;
}

const secret = nextAuthSecret();

if (process.env.NODE_ENV === "production" && !secret) {
  console.error(
    "[auth] V produkci chybí NEXTAUTH_SECRET (nebo AUTH_SECRET). " +
      "V Railway: Project → Variables → přidej NEXTAUTH_SECRET=náhodný řetězec (např. `openssl rand -base64 32`). " +
      "NEXTAUTH_URL musí být veřejná URL tvé aplikace (https://…)."
  );
}

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const googleConfigured = Boolean(googleClientId && googleClientSecret);

if (process.env.NODE_ENV === "production" && !googleConfigured) {
  console.error(
    "[auth] Chybí Google OAuth: nastav v Railway Variables GOOGLE_CLIENT_ID a GOOGLE_CLIENT_SECRET " +
      "(Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client). " +
      "Authorized redirect URI: https://<tvá-domena>/api/auth/callback/google"
  );
}

/** True když jsou nastavené GOOGLE_CLIENT_ID i GOOGLE_CLIENT_SECRET (např. pro skrytí tlačítka na klientovi). */
export const googleOAuthConfigured = googleConfigured;

const providers: NextAuthOptions["providers"] = googleConfigured
  ? [
      GoogleProvider({
        clientId: googleClientId!,
        clientSecret: googleClientSecret!,
        /**
         * Bez toho NextAuth vyhodí OAuthAccountNotLinked („sign in with the same account…“), když User se stejným
         * e-mailem už v DB je, ale řádek Account pro tento Google sub ještě neexistuje (reconnect, migrace, apod.).
         * Google ověřuje vlastnictví e-mailu; riziko popisuje NextAuth FAQ.
         */
        allowDangerousEmailAccountLinking: true,
        authorization: {
          params: {
            prompt: "select_account",
          },
        },
      }),
    ]
  : [];

export const authOptions: NextAuthOptions = {
  /** Konzistentní s veřejnou URL; na https produkci nutné pro prefix `__Secure-` u OAuth cookies. */
  useSecureCookies: process.env.NEXTAUTH_URL
    ? process.env.NEXTAUTH_URL.startsWith("https://")
    : process.env.NODE_ENV === "production",
  adapter: PrismaAdapter(prisma),
  pages: {
    /** Výchozí `/api/auth/signin` nahrazeno vlastní stránkou — čitelná chyba z `?error=` místo slepého tlačítka. */
    signIn: "/auth/signin",
  },
  providers,
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  secret,
};
