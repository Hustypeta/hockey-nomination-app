import { EliteProspectsPlayerCards } from "@/components/marketing/EliteProspectsPlayerCards";

export const metadata = {
  title: "Karty hráčů (promo)",
};

export default function PromoPlayerCardsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_20%_-10%,rgba(0,229,255,0.10),transparent_55%),radial-gradient(ellipse_at_80%_-10%,rgba(255,30,46,0.10),transparent_55%),linear-gradient(180deg,#0A0E17_0%,#05080f_100%)]">
      <EliteProspectsPlayerCards />
    </main>
  );
}

