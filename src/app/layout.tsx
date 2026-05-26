import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FrozenArenaAmbientBackground } from "@/components/site/FrozenArenaAmbientBackground";
import { AuthProvider } from "@/components/AuthProvider";
import { CompleteRegistrationTracker } from "@/components/CompleteRegistrationTracker";
import { MetaPixel } from "@/components/MetaPixel";
import { UmamiAnalytics } from "@/components/UmamiAnalytics";
import { Toaster } from "sonner";
import {
  SITE_ICON_URL,
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
  toCanonicalHokejlineupUrl,
} from "@/lib/siteBranding";
import { resolveFacebookAppId } from "@/lib/facebookApp";

const SITE_URL = "https://hokejlineup.cz";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

function metadataBaseUrl(): URL {
  for (const raw of [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXTAUTH_URL]) {
    const t = raw?.trim();
    if (!t) continue;
    try {
      return toCanonicalHokejlineupUrl(t);
    } catch {
      /* ignore */
    }
  }
  return new URL(SITE_URL);
}

/** fb:app_id — `metadata.facebook.appId` (správné `property=`) + env `FACEBOOK_APP_ID` (viz {@link resolveFacebookAppId}). */
export async function generateMetadata(): Promise<Metadata> {
  const facebookAppId = resolveFacebookAppId();
  const previewText = "Editor sestavy, pick'em, fantasy a hodnocení hráčů.";
  const defaultTitle = "Lineup – hokejový editor sestavy";
  return {
    metadataBase: metadataBaseUrl(),
    title: {
      default: defaultTitle,
      template: "%s | Lineup",
    },
    description: previewText,
    icons: {
      icon: [
        { url: "/icon", type: "image/svg+xml" },
        { url: SITE_ICON_URL, type: "image/png" },
      ],
      apple: [{ url: "/apple-icon", type: "image/svg+xml" }],
    },
    ...(facebookAppId
      ? { facebook: { appId: facebookAppId } as const }
      : {}),
    openGraph: {
      type: "website",
      locale: "cs_CZ",
      siteName: "Lineup",
      description: previewText,
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
      description: previewText,
      images: [SITE_OG_DEFAULT_IMAGE_URL],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lineup",
    url: SITE_URL,
    description: "Editor sestavy, pick'em, fantasy a hodnocení hráčů.",
  } as const;

  return (
    <html lang="cs">
      <head>
        <UmamiAnalytics />
      </head>
      <body className="relative antialiased min-h-screen bg-[#020408] font-sans text-white">
        <FrozenArenaAmbientBackground />
        <script
          type="application/ld+json"
          // JSON-LD musí být čisté JSON string (ne JSX object)
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <div className="relative z-0">
          <MetaPixel />
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
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
