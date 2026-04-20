import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { SiteShell } from "@/components/site/SiteShell";
import { SitePageHero } from "@/components/site/SitePageHero";
import { BracketPickemComingSoon } from "@/components/bracket/BracketPickemComingSoon";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Fórum",
  description: "Sdílení nominací, diskuze a reakce — připravujeme.",
};

export default async function ForumPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent("/forum")}`);
  }

  return (
    <SiteShell>
      <SitePageHero
        kicker="Komunita"
        title="Fórum"
        subtitle="Tady budou sdílené nominace, komentáře a lajky. Zatím připravujeme rozhraní."
        align="center"
      />
      <BracketPickemComingSoon />
    </SiteShell>
  );
}
