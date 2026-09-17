import type { Metadata } from "next";
import { Suspense } from "react";
import { JerseyPosterPreviewClient } from "./JerseyPosterPreviewClient";

export const metadata: Metadata = {
  title: "Promo — náhled plakátu dres + jméno",
  robots: { index: false, follow: false },
};

export default function JerseyPosterPreviewPage() {
  return (
    <Suspense fallback={null}>
      <JerseyPosterPreviewClient />
    </Suspense>
  );
}
