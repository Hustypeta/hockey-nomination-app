"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { TipsportPartnerBanner } from "@/components/marketing/TipsportPartnerBanner";
import { FIFA_BTN_PRIMARY, FIFA_KICKER } from "@/lib/fifa/fifaUiClasses";

function subscribeNever() {
  return () => undefined;
}
function clientMounted() {
  return true;
}
function serverMounted() {
  return false;
}

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
  onActiveIndexChange,
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
  onActiveIndexChange?: (index: number) => void;
}) {
  const mounted = useSyncExternalStore(subscribeNever, clientMounted, serverMounted);
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (index: number) => {
    setActiveIndex(index);
    onActiveIndexChange?.(index);
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || choices.length < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => {
          const nextIndex = (current - 1 + choices.length) % choices.length;
          onActiveIndexChange?.(nextIndex);
          return nextIndex;
        });
      } else if (event.key === "ArrowRight") {
        setActiveIndex((current) => {
          const nextIndex = (current + 1) % choices.length;
          onActiveIndexChange?.(nextIndex);
          return nextIndex;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [choices.length, onActiveIndexChange, open]);

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
  const previous = () => goTo((activeIndex - 1 + choices.length) % choices.length);
  const next = () => goTo((activeIndex + 1) % choices.length);

  return createPortal(
    <div
      className="fifa-share-modal-backdrop z-[310]"
      onClick={() => busyKey === null && onClose()}
      role="presentation"
    >
      <div
        className="fifa-share-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-export-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="fifa-share-modal__head">
            <div>
              <p className={`mb-1 ${FIFA_KICKER}`}>{eyebrow}</p>
              <h2 id="match-export-modal-title" className="font-display text-xl tracking-wide text-[var(--fifa-text)]">
                {title}
              </h2>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--fifa-text-muted)]">
                {description ?? "Vyber plakát a stáhni hotové PNG."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={busyKey !== null}
              className="fifa-forum-modal__close disabled:opacity-50"
              aria-label="Zavřít"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="fifa-share-modal__stage px-3">
            <button
              type="button"
              onClick={previous}
              disabled={choices.length < 2}
              aria-label="Předchozí plakát"
              className="absolute left-2 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--fifa-border)] bg-[var(--fifa-bg-base)]/80 text-[var(--fifa-text)] shadow-xl backdrop-blur transition hover:border-[var(--fifa-border-strong)] hover:bg-[var(--fifa-bg-hover)] disabled:opacity-30 sm:left-4"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>

            <section className="flex h-full min-h-0 w-full flex-col items-center justify-center px-12 py-3 sm:px-14">
              <div className="mb-2 flex shrink-0 items-center gap-3">
                <h3 className="font-display text-base font-black uppercase tracking-wide text-[var(--fifa-text)] sm:text-lg">
                  {activeChoice.title}
                </h3>
                <span className="rounded-full border border-[var(--fifa-border)] bg-[var(--fifa-accent-muted)] px-2.5 py-1 text-[10px] font-bold text-[var(--fifa-accent-text)]">
                  {activeIndex + 1} / {choices.length}
                </span>
              </div>

              <div className="relative aspect-[4/5] min-h-0 w-full max-w-[300px] flex-1">
                {stackedChoices.map(({ choice, depth }) => (
                  <div
                    key={`${choice.key}-stack`}
                    className={`absolute inset-0 overflow-hidden rounded-2xl border border-[var(--fifa-border)] shadow-[0_16px_40px_rgba(0,0,0,0.48)] ${previewChromeFillClass(choice)}`}
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
                  className={`absolute inset-0 z-30 flex items-center justify-center overflow-hidden rounded-2xl border border-[var(--fifa-border-strong)] shadow-[0_24px_65px_rgba(0,0,0,0.58)] ${previewChromeFillClass(activeChoice)}`}
                >
                  {activeChoice.previewDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeChoice.previewDataUrl}
                      alt={`Náhled: ${activeChoice.title}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-[var(--fifa-text-muted)]">
                      <span className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--fifa-border)] border-t-[var(--fifa-accent)]" />
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
                    onClick={() => goTo(index)}
                    aria-label={`Zobrazit ${choice.title}`}
                    className={`h-2 rounded-full transition ${
                      index === activeIndex ? "w-7 bg-[var(--fifa-accent)]" : "w-2 bg-[var(--fifa-border)] hover:bg-[var(--fifa-text-muted)]"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={busyKey !== null || previewsBusy || !activeChoice.previewDataUrl}
                onClick={() => void onPick(activeChoice.key)}
                className={`${FIFA_BTN_PRIMARY} mt-2 w-full max-w-[300px] shrink-0 py-3 uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-55`}
              >
                {loading ? "Připravuji PNG…" : "Stáhnout PNG"}
              </button>
            </section>

            <button
              type="button"
              onClick={next}
              disabled={choices.length < 2}
              aria-label="Další plakát"
              className="absolute right-2 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--fifa-border)] bg-[var(--fifa-bg-base)]/80 text-[var(--fifa-text)] shadow-xl backdrop-blur transition hover:border-[var(--fifa-border-strong)] hover:bg-[var(--fifa-bg-hover)] disabled:opacity-30 sm:right-4"
            >
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
          </div>

          <TipsportPartnerBanner
            compact
            className="fifa-design-tipsport-compact mx-auto w-full max-w-xs shrink-0 border-t border-[var(--fifa-border)] px-3 py-2 [&>a]:mt-0 [&>p:last-child]:mt-1 [&>p:last-child]:text-[9px]"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
