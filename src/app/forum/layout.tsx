import type { ReactNode } from "react";
import { requireSignedInPage } from "@/lib/requireSignedInPage";

export const dynamic = "force-dynamic";

export default async function ForumLayout({ children }: { children: ReactNode }) {
  await requireSignedInPage("/forum");
  return children;
}
