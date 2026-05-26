import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Zápasy — Beijir",
  robots: { index: false, follow: false },
};

/** Přehled zápasů je skrytý — program je ve Fantasy. */
export default function ZapasyBeijirRedirectPage() {
  redirect("/fantasy");
}
