import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Přihlášení",
  robots: "noindex, follow",
};

export default function AuthSignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
