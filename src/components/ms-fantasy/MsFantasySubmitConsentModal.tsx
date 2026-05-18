"use client";

import Link from "next/link";
import { Loader2, X } from "lucide-react";

type MsFantasySubmitConsentModalProps = {
  open: boolean;
  onClose: () => void;
  consent: boolean;
  onConsentChange: (checked: boolean) => void;
  onConfirm: () => void;
  saving: boolean;
};

export function MsFantasySubmitConsentModal({
  open,
  onClose,
  consent,
  onConsentChange,
  onConfirm,
  saving,
}: MsFantasySubmitConsentModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => !saving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ms-fantasy-submit-consent-title"
        className="w-full max-w-md rounded-t-2xl border border-cyan-500/25 bg-gradient-to-b from-[#0a1220] to-[#05080f] shadow-[0_0_48px_rgba(0,180,255,0.15)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
          <div>
            <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cyan-300/90">
              Odeslání do soutěže
            </p>
            <h2 id="ms-fantasy-submit-consent-title" className="mt-1 font-display text-lg font-bold text-white">
              Potvrzení účasti
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] disabled:opacity-50"
            aria-label="Zavřít"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-3.5 has-[:checked]:border-cyan-400/35 has-[:checked]:bg-cyan-500/[0.08]">
            <input
              id="ms-fantasy-rules-consent"
              type="checkbox"
              checked={consent}
              disabled={saving}
              onChange={(e) => onConsentChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/25 bg-black/40 text-cyan-400 focus:ring-cyan-400/40"
            />
            <span className="text-sm leading-relaxed text-slate-200">
              Souhlasím s{" "}
              <Link
                href="/fantasy/pravidla"
                className="font-semibold text-cyan-300 underline decoration-cyan-500/40 underline-offset-2 hover:text-cyan-200"
                onClick={(e) => e.stopPropagation()}
              >
                pravidly soutěže
              </Link>{" "}
              a potvrzuji, že je mi více než 18 let. <span className="text-slate-400">(povinné)</span>
            </span>
          </label>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/[0.08] disabled:opacity-50"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!consent || saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-gradient-to-r from-[#005a8c] via-[#00B4FF] to-[#38bdf8] px-4 py-2.5 text-sm font-bold text-[#03050a] shadow-[0_0_24px_rgba(0,200,255,0.35)] disabled:pointer-events-none disabled:opacity-40"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Odesílám…
                </>
              ) : (
                "Potvrdit a odeslat"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
