"use client";

import { signIn } from "next-auth/react";
import { X } from "lucide-react";

export function GoogleSignInRequiredModal({
  open,
  onClose,
  callbackUrl,
  onBeforeSignIn,
}: {
  open: boolean;
  onClose: () => void;
  callbackUrl: string;
  onBeforeSignIn?: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="google-signin-required-title"
        className="w-full max-w-md rounded-2xl border border-white/12 bg-[#0b1220] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Účet</p>
            <h2 id="google-signin-required-title" className="mt-1 font-display text-lg font-black text-white">
              Pro uložení se přihlas přes Google
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Bez přihlášení sestavu uložit nejde. Po Google účtu ti sestava zůstane a můžeš ji uložit.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-2">
          <button
            type="button"
            className="w-full rounded-xl bg-gradient-to-r from-[#c8102e] to-[#003087] px-4 py-3 text-sm font-black text-white shadow-[0_16px_44px_rgba(0,0,0,0.22)] ring-1 ring-white/15 hover:brightness-110"
            onClick={() => {
              onBeforeSignIn?.();
              void signIn("google", { callbackUrl });
            }}
          >
            Přihlásit se přes Google
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/[0.08]"
            onClick={onClose}
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}
