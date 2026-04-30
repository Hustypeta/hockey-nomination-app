"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

type FbqParams = Record<string, unknown>;
type FbqFn = {
  (action: "init", pixelId: string): void;
  (action: "track", eventName: string, params?: FbqParams): void;
  (action: "trackCustom", eventName: string, params?: FbqParams): void;
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

export function metaTrack(action: "track" | "trackCustom", eventName: string, params?: FbqParams) {
  if (typeof window === "undefined") return;
  try {
    const fbq = window.fbq;
    if (!fbq) return;
    if (action === "track") fbq("track", eventName, params);
    else fbq("trackCustom", eventName, params);
  } catch {
    /* ignore */
  }
}

export function MetaPixel() {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  if (!id) return null;

  const pathname = usePathname();
  useEffect(() => {
    // App Router: PageView i při client-side navigaci
    metaTrack("track", "PageView");
  }, [pathname]);

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- fallback pixel for no-js */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${encodeURIComponent(id)}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

