"use client";

import { useEffect, useState } from "react";
import { SquadEditorPanelSnapshot } from "@/components/marketing/SquadEditorPanelSnapshot";

/** Po mountu + krátké prodlevě (fonty / dresy) nastaví `data-capture-ready` pro Playwright. */
export function SquadCaptureClient() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      id="squad-capture-root"
      data-capture-ready={ready ? "true" : undefined}
      className="w-[640px] max-w-full shrink-0"
    >
      <SquadEditorPanelSnapshot />
    </div>
  );
}
