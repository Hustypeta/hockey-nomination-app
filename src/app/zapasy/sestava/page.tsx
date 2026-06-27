import { getServerSession } from "next-auth/next";
import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MatchLineupBuilderPage } from "@/components/match/MatchLineupBuilderPage";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata = {
  title: "Editor sestavy",
};

function SestavaFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent text-sm text-white/70">
      Načítám editor…
    </div>
  );
}

export default async function MatchLineupBuilderRoute() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/zapasy/sestava");
  }
  return (
    <SiteShell showFooter={false}>
      <Suspense fallback={<SestavaFallback />}>
        <MatchLineupBuilderPage />
      </Suspense>
    </SiteShell>
  );
}

