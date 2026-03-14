import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MS 2026 | Sestavovač nominace",
  description: "Sestav si svou nominaci na Mistrovství světa v hokeji 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased min-h-screen bg-[#0c0e12]">
        {children}
      </body>
    </html>
  );
}
