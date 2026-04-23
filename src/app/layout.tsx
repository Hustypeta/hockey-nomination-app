import type { Metadata } from "next";
import "./globals.css";
import { FacebookAppIdMeta } from "@/components/FacebookAppIdMeta";
import { AuthProvider } from "@/components/AuthProvider";
import { CompleteRegistrationTracker } from "@/components/CompleteRegistrationTracker";
import { MetaPixel } from "@/components/MetaPixel";
import { Toaster } from "sonner";
import {
  SITE_ICON_URL,
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
} from "@/lib/siteBranding";

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

/** fb:app_id řeší navíc {@link FacebookAppIdMeta} v <head> + env FACEBOOK_APP_ID (runtime). */
export async function generateMetadata(): Promise<Metadata> {
  return {
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
    openGraph: {
      type: "website",
      locale: "cs_CZ",
      siteName: "Lineup",
      images: [
        {
          url: SITE_OG_DEFAULT_IMAGE_URL,
          width: SITE_OG_DEFAULT_IMAGE_WIDTH,
          height: SITE_OG_DEFAULT_IMAGE_HEIGHT,
          alt: "Sestav si nominaci na MS 2026 a vyhraj dres — Lineup · hokejlineup.cz",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [SITE_OG_DEFAULT_IMAGE_URL],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <head>
        <FacebookAppIdMeta />
        <MetaPixel />
      </head>
      <body className="antialiased min-h-screen bg-[#05080f] font-sans text-white">
        <AuthProvider>
          <CompleteRegistrationTracker />
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
