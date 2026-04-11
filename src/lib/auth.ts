import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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
      }),
    ]
  : [];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  secret,
};
