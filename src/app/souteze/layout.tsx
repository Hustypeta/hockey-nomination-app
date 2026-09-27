import type { ReactNode } from "react";
import { headers } from "next/headers";
import { requireSignedInPage } from "@/lib/requireSignedInPage";

export const dynamic = "force-dynamic";

function isSoutezeHub(path: string): boolean {
  const bare = path.split("?")[0]?.replace(/\/+$/, "") || "/";
  return bare === "/souteze";
}

export default async function SoutezeLayout({ children }: { children: ReactNode }) {
  const h = await headers();
  const path = h.get("x-callback-path") ?? "";
  if (!isSoutezeHub(path)) {
    await requireSignedInPage(path.startsWith("/") ? path : "/souteze");
  }
  return children;
}
