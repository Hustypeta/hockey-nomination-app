import { EliteProspectsPlayerCards } from "@/components/marketing/EliteProspectsPlayerCards";

export const metadata = {
  title: "Karty hráčů (promo)",
};

function pickQueryP(raw: string | string[] | undefined): string {
  if (raw === undefined) return "";
  const s = Array.isArray(raw) ? raw[0] : raw;
  return typeof s === "string" ? s.trim() : "";
}

export default async function PromoPlayerCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string | string[] }>;
}) {
  const sp = await searchParams;
  const initialPlayerId = pickQueryP(sp.p);
  return (
    <main className="min-h-screen bg-white">
      <EliteProspectsPlayerCards initialPlayerId={initialPlayerId} />
    </main>
  );
}

