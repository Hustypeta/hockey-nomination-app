"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { NominationView } from "@/app/nominations/[id]/NominationView";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { decodeSharePayload } from "@/lib/sharePayload";
import type { SharePayload } from "@/lib/sharePayload";
import { lineupToPlayers } from "@/lib/lineupUtils";
import type { Player } from "@/types";

function useClientLocationHref() {
  return useSyncExternalStore(
    () => () => {},
    () => (typeof window !== "undefined" ? window.location.href : ""),
    () => ""
  );
}

function ShareContentInner({
  initialZ,
  initialPayload,
  nominationTitle,
}: {
  initialZ: string | null;
  initialPayload: SharePayload | null;
  nominationTitle?: string | null;
}) {
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

  const payload = initialPayload ?? (initialZ ? decodeSharePayload(initialZ) : null);

  if (loading) {
    return <AppLoadingScreen message="Načítám odkaz…" intro={null} />;
  }

  if (!payload) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0e12] px-4">
        <p className="mb-4 font-display text-xl text-white">Odkaz je neplatný nebo poškozený.</p>
        <Link href="/sestava" className="text-[#c41e3a] hover:underline">
          ← Zpět na editor sestavy
        </Link>
      </div>
    );
  }

  const ordered = lineupToPlayers(payload.lineupStructure, players);
  if (ordered.length !== 25) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0e12] px-4">
        <p className="mb-4 text-center font-display text-xl text-white">
          V odkazu chybí data hráčů nebo je sestava nekompletní.
        </p>
        <Link href="/sestava" className="text-[#c41e3a] hover:underline">
          ← Zpět na editor sestavy
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
      title={nominationTitle ?? undefined}
      allowDownload
      linkToCopy={fullUrl || undefined}
    />
  );
}

export function SharePageClient({
  initialZ,
  initialPayload = null,
  nominationTitle = null,
}: {
  initialZ: string | null;
  initialPayload?: SharePayload | null;
  nominationTitle?: string | null;
}) {
  return (
    <ShareContentInner
      initialZ={initialZ}
      initialPayload={initialPayload}
      nominationTitle={nominationTitle}
    />
  );
}
