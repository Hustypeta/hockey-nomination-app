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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  secret,
};
