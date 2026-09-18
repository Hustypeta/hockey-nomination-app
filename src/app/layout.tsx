import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FrozenArenaAmbientBackground } from "@/components/site/FrozenArenaAmbientBackground";
import { AuthProvider } from "@/components/AuthProvider";
import { CompleteRegistrationTracker } from "@/components/CompleteRegistrationTracker";
import { MetaPixel } from "@/components/MetaPixel";
import { UmamiAnalytics } from "@/components/UmamiAnalytics";
import { Toaster } from "sonner";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  SITE_APPLE_TOUCH_ICON_URL,
  SITE_ICON_URL,
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
  toCanonicalHokejlineupUrl,
} from "@/lib/siteBranding";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_ALT,
  DEFAULT_TITLE,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
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
  return {
    metadataBase: metadataBaseUrl(),
    title: {
      default: DEFAULT_TITLE,
      template: "%s | Lineup",
    },
    description: DEFAULT_DESCRIPTION,
    // Brand favicon: `public/images/logo/icon.png` (+ `app/favicon.ico`, `app/icon.png`, `public/apple-touch-icon.png`).
    icons: {
      icon: [{ url: SITE_ICON_URL, type: "image/png", sizes: "512x512" }],
      shortcut: [{ url: SITE_ICON_URL, type: "image/png" }],
      apple: [{ url: SITE_APPLE_TOUCH_ICON_URL, type: "image/png", sizes: "180x180" }],
    },
    ...(facebookAppId
      ? { facebook: { appId: facebookAppId } as const }
      : {}),
    openGraph: {
      type: "website",
      locale: "cs_CZ",
      siteName: "Lineup",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: SITE_OG_DEFAULT_IMAGE_URL,
          width: SITE_OG_DEFAULT_IMAGE_WIDTH,
          height: SITE_OG_DEFAULT_IMAGE_HEIGHT,
          alt: DEFAULT_OG_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
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
    <html lang="cs" suppressHydrationWarning>
      <head>
        <UmamiAnalytics />
      </head>
      <body
        suppressHydrationWarning
        className="relative antialiased min-h-screen bg-[#05060f] font-sans text-white"
      >
        <FrozenArenaAmbientBackground />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <AuthProvider>
          <div className="relative z-[1]">
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
