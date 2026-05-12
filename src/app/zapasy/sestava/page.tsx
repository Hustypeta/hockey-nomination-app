import { getServerSession } from "next-auth/next";
import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MatchLineupBuilderPage } from "@/components/match/MatchLineupBuilderPage";

export const metadata = {
  title: "Editor sestavy",
};

function SestavaFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#03050a] text-sm text-white/70">
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
    <Suspense fallback={<SestavaFallback />}>
      <MatchLineupBuilderPage />
    </Suspense>
  );
}

