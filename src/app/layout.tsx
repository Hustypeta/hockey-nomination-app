import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "MS 2026 | Nominace",
    template: "%s | MS 2026",
  },
  description: "Sestav si nominaci české reprezentace na MS v hokeji 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased min-h-screen bg-[#0c0e12]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
