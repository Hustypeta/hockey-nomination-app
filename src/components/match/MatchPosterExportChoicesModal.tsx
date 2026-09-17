"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { TipsportPartnerBanner } from "@/components/marketing/TipsportPartnerBanner";

/** Square 4:5 PNG sits in a rounded frame — fill matches the poster surface. */
function previewChromeFillClass(choice: { key: string; previewLight?: boolean }): string {
  const lightSurface = choice.previewLight ?? choice.key === "cele-dresy";
  return lightSurface ? "bg-white" : "bg-black";
}

export function MatchPosterExportChoicesModal({
  open,
  onClose,
  eyebrow,
  title,
  description,
  busyKey,
  previewsBusy = false,
  choices,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  description?: string;
  busyKey: string | null;
  previewsBusy?: boolean;
  choices: Array<{
    key: string;
    title: string;
    hint?: string;
    previewDataUrl?: string | null;
    previewLight?: boolean;
  }>;
  onPick: (key: string) => void | Promise<void>;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open || choices.length < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current - 1 + choices.length) % choices.length);
      } else if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current + 1) % choices.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [choices.length, open]);

  if (!open || !mounted) return null;

  const activeChoice = choices[activeIndex] ?? choices[0];
  if (!activeChoice) return null;
  const stackedChoices = Array.from(
    { length: Math.min(2, Math.max(0, choices.length - 1)) },
    (_, index) => ({
      choice: choices[(activeIndex + index + 1) % choices.length],
      depth: index + 1,
    })
  ).reverse();
  const loading = busyKey === activeChoice.key;
  const previous = () =>
    setActiveIndex((current) => (current - 1 + choices.length) % choices.length);
  const next = () => setActiveIndex((current) => (current + 1) % choices.length);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={() => busyKey === null && onClose()}
      role="presentation"
    >
      <div
        className="card-glow flex h-[min(92dvh,760px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-b from-[#1a1f2e] via-[#12151f] to-[#0c0e14] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-export-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-start justify-between gap-5 border-b border-white/10 px-5 py-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[#f1c40f]/90">{eyebrow}</p>
              <h2 id="match-export-modal-title" className="font-display text-xl tracking-wide text-white">
                {title}
              </h2>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-white/55">
                {description ?? "Vyber plakát a stáhni hotové PNG."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={busyKey !== null}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.08] disabled:opacity-50"
              aria-label="Zavřít"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(30,64,175,0.18),transparent_70%)] px-3">
            <button
              type="button"
              onClick={previous}
              disabled={choices.length < 2}
              aria-label="Předchozí plakát"
              className="absolute left-2 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-xl backdrop-blur transition hover:border-[#f1c40f]/45 hover:bg-black/70 disabled:opacity-30 sm:left-4"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>

            <section className="flex h-full min-h-0 w-full flex-col items-center justify-center px-12 py-3 sm:px-14">
              <div className="mb-2 flex shrink-0 items-center gap-3">
                <h3 className="font-display text-base font-black uppercase tracking-wide text-white sm:text-lg">
                  {activeChoice.title}
                </h3>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold text-white/55">
                  {activeIndex + 1} / {choices.length}
                </span>
              </div>

              <div className="relative aspect-[4/5] min-h-0 w-full max-w-[300px] flex-1">
                {stackedChoices.map(({ choice, depth }) => (
                  <div
                    key={`${choice.key}-stack`}
                    className={`absolute inset-0 overflow-hidden rounded-2xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.48)] ${previewChromeFillClass(choice)}`}
                    style={{
                      zIndex: 20 - depth,
                      transform: `translate(${depth * 13}px, ${depth * 5}px) rotate(${depth * 1.8}deg)`,
                      opacity: depth === 1 ? 0.82 : 0.58,
                    }}
                    aria-hidden
                  >
                    {choice.previewDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={choice.previewDataUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                ))}

                <div
                  className={`absolute inset-0 z-30 flex items-center justify-center overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_65px_rgba(0,0,0,0.58)] ${previewChromeFillClass(activeChoice)}`}
                >
                  {activeChoice.previewDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeChoice.previewDataUrl}
                      alt={`Náhled: ${activeChoice.title}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-white/45">
                      <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-[#f1c40f]" />
                      <span className="text-xs font-bold uppercase tracking-widest">Připravuji náhled</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 flex shrink-0 items-center gap-2">
                {choices.map((choice, index) => (
                  <button
                    key={choice.key}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Zobrazit ${choice.title}`}
                    className={`h-2 rounded-full transition ${
                      index === activeIndex ? "w-7 bg-[#f1c40f]" : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={busyKey !== null || previewsBusy || !activeChoice.previewDataUrl}
                onClick={() => void onPick(activeChoice.key)}
                className="mt-2 w-full max-w-[300px] shrink-0 rounded-xl bg-gradient-to-r from-[#f1c40f] to-[#c8102e] px-5 py-3 text-sm font-black uppercase tracking-wide text-[#03050a] shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {loading ? "Připravuji PNG…" : "Stáhnout PNG"}
              </button>
            </section>

            <button
              type="button"
              onClick={next}
              disabled={choices.length < 2}
              aria-label="Další plakát"
              className="absolute right-2 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-xl backdrop-blur transition hover:border-[#f1c40f]/45 hover:bg-black/70 disabled:opacity-30 sm:right-4"
            >
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
          </div>

          <TipsportPartnerBanner
            compact
            className="mx-auto w-full max-w-xs shrink-0 border-t border-white/10 px-3 py-2 [&>a]:mt-0 [&>p:first-child]:hidden [&>p:last-child]:mt-1 [&>p:last-child]:text-[9px]"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
