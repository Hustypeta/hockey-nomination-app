"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { NominationView } from "@/app/nominations/[id]/NominationView";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { decodeSharePayload } from "@/lib/sharePayload";
import { lineupToPlayers } from "@/lib/lineupUtils";
import type { Player } from "@/types";

function useClientLocationHref() {
  return useSyncExternalStore(
    () => () => {},
    () => (typeof window !== "undefined" ? window.location.href : ""),
    () => ""
  );
}

function ShareContent() {
  const searchParams = useSearchParams();
  const z = searchParams.get("z");
  const { status } = useSession();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const fullUrl = useClientLocationHref();

  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data: Player[]) => setPlayers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const payload = z ? decodeSharePayload(z) : null;

  if (loading) {
    return <AppLoadingScreen message="Načítám odkaz…" />;
  }

  if (!payload) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0e12] px-4">
        <p className="text-white font-display text-xl mb-4">Odkaz je neplatný nebo poškozený.</p>
        <Link href="/sestava" className="text-[#c41e3a] hover:underline">
          ← Zpět na sestavovač
        </Link>
      </div>
    );
  }

  const ordered = lineupToPlayers(payload.lineupStructure, players);
  if (ordered.length !== 25) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0e12] px-4">
        <p className="text-white font-display text-xl mb-4 text-center">
          V odkazu chybí data hráčů nebo je sestava nekompletní.
        </p>
        <Link href="/sestava" className="text-[#c41e3a] hover:underline">
          ← Zpět na sestavovač
        </Link>
      </div>
    );
  }

  return (
    <NominationView
      players={ordered}
      captainId={payload.captainId}
      lineupStructure={payload.lineupStructure}
      nominationId="share"
      allowDownload={status === "authenticated"}
      linkToCopy={fullUrl || undefined}
    />
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<AppLoadingScreen message="Načítám…" />}>
      <ShareContent />
    </Suspense>
  );
}
