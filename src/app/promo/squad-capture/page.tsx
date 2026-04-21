import type { Metadata } from "next";
import { SquadCaptureClient } from "./SquadCaptureClient";

export const metadata: Metadata = {
  title: "Promo — capture soupiska",
  description: "Stránka pro generování PNG editoru soupisky (Playwright).",
  robots: { index: false, follow: false },
};

/**
 * Izolovaný editor soupisky pro screenshot — `npm run promo:capture-squad` (běží `next dev`).
 */
export default function PromoSquadCapturePage() {
  return (
    <div className="min-h-screen bg-slate-200 px-4 py-8 flex justify-center">
      <SquadCaptureClient />
    </div>
  );
}
