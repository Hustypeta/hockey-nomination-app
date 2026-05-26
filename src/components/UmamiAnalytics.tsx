import Script from "next/script";

const DEFAULT_SCRIPT_SRC = "https://umami-production-5439.up.railway.app/script.js";
const DEFAULT_WEBSITE_ID = "e1cd9081-6fa6-4ffd-a3d7-627dbba34a89";

/**
 * Umami — měření návštěvnosti (globálně z root layoutu).
 * Přepsání: NEXT_PUBLIC_UMAMI_SCRIPT_URL, NEXT_PUBLIC_UMAMI_WEBSITE_ID
 * Vypnutí: NEXT_PUBLIC_UMAMI_DISABLED=1
 */
export function UmamiAnalytics() {
  if (process.env.NEXT_PUBLIC_UMAMI_DISABLED === "1") return null;

  const websiteId =
    process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim() || DEFAULT_WEBSITE_ID;
  const scriptSrc =
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim() || DEFAULT_SCRIPT_SRC;

  if (!websiteId) return null;

  return (
    <Script
      defer
      src={scriptSrc}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
