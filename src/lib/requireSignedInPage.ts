import { getServerSession } from "next-auth/next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

function safeCallbackPath(raw: string | null | undefined, fallback: string): string {
  const t = raw?.trim() || "";
  if (!t.startsWith("/") || t.startsWith("//") || t.startsWith("/\\")) return fallback;
  return t;
}

/** Stránka jen pro přihlášené — jinak Google sign-in a návrat na původní URL. */
export async function requireSignedInPage(fallbackPath: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return;

  const h = await headers();
  const fromHeader = h.get("x-callback-path");
  const callback = safeCallbackPath(fromHeader, fallbackPath);
  redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callback)}`);
}
