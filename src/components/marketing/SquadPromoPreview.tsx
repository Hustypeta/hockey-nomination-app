"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { SquadEditorPanelSnapshot } from "@/components/marketing/SquadEditorPanelSnapshot";

/** Ukázka z reálného editoru (statický PNG v repu). */
export const FB_COVER_SQUAD_SHOWCASE_PNG = "/images/promo/squad-builder-showcase.png";
/** Vygenerovaný snímek — `npm run promo:capture-squad` → totéž složka. */
export const FB_COVER_SQUAD_EDITOR_PNG = "/images/promo/fb-cover-squad-editor.png";

const FALLBACK_CHAIN = [FB_COVER_SQUAD_SHOWCASE_PNG, FB_COVER_SQUAD_EDITOR_PNG] as const;

const SNAPSHOT_INNER_W = 640;

function ScaledLiveSquadEditor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerMeasureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.28);

  const updateScale = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerMeasureRef.current;
    if (!outer || !inner) return;
    const iw = inner.scrollWidth;
    const ih = inner.scrollHeight;
    const ow = outer.clientWidth;
    const oh = outer.clientHeight;
    if (iw < 8 || ih < 8 || ow < 8 || oh < 8) return;
    const s = Math.min(ow / iw, oh / ih, 1);
    if (Number.isFinite(s) && s > 0) setScale(s);
  }, []);

  useLayoutEffect(() => {
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (outerRef.current) ro.observe(outerRef.current);
    if (innerMeasureRef.current) ro.observe(innerMeasureRef.current);
    window.addEventListener("resize", updateScale);
    const t = window.setTimeout(updateScale, 120);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [updateScale]);

  return (
    <div
      ref={outerRef}
      className="pointer-events-none relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.11] bg-black/25 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.06]"
    >
      <div className="flex min-h-0 flex-1 items-start justify-center overflow-hidden px-0.5 pt-0.5">
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
          <div ref={innerMeasureRef} className="min-w-0" style={{ width: SNAPSHOT_INNER_W }}>
            <SquadEditorPanelSnapshot />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Preferuje PNG – nejdřív uživatelský screenshot editoru, pak Playwright výstup;
 * při chybějícím souboru řetězeně zkouší další; nakonec živý LineBuilder se škálováním.
 */
export function SquadPromoPreview() {
  const [step, setStep] = useState(0);

  if (step >= FALLBACK_CHAIN.length) {
    return <ScaledLiveSquadEditor />;
  }

  const src = FALLBACK_CHAIN[step];

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/[0.11] bg-black/25 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.06]">
      {/* eslint-disable-next-line @next/next/no-img-element -- lokální PNG z public/ */}
      <img
        src={src}
        alt=""
        className="pointer-events-none max-h-full min-h-0 w-full object-contain object-top"
        onError={() => setStep((s) => s + 1)}
      />
    </div>
  );
}
