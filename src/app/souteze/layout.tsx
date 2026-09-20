import type { ReactNode } from "react";
import { requireSignedInPage } from "@/lib/requireSignedInPage";

export const dynamic = "force-dynamic";

export default async function SoutezeLayout({ children }: { children: ReactNode }) {
  await requireSignedInPage("/souteze");
  return children;
}
