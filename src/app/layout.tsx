import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "sonner";
import { SITE_ICON_URL } from "@/lib/siteBranding";

function metadataBaseUrl(): URL {
  for (const raw of [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXTAUTH_URL]) {
    const t = raw?.trim();
    if (!t) continue;
    try {
      return new URL(t);
    } catch {
      /* ignore */
    }
  }
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: "Lineup",
    template: "%s | Lineup",
  },
  description: "Fanouškovský editor sestavy, soutěž a sdílení.",
  icons: {
    icon: SITE_ICON_URL,
    apple: SITE_ICON_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased min-h-screen bg-[#05080f] font-sans text-white">
        <AuthProvider>
          {children}
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              classNames: {
                toast: "border border-white/10 bg-[#141414] text-white",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
