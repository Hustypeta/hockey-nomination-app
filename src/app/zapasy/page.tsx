import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Zápasy",
  robots: { index: false, follow: false },
};

export default function ZapasyIndexRedirectPage() {
  redirect("/fantasy");
}

