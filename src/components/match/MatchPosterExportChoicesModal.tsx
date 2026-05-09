"use client";

export function MatchPosterExportChoicesModal({
  open,
  onClose,
  eyebrow,
  title,
  description,
  busyKey,
  choices,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  description?: string;
  busyKey: string | null;
  choices: Array<{ key: string; title: string; hint?: string }>;
  onPick: (key: string) => void | Promise<void>;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-md sm:p-6"
      onClick={() => busyKey === null && onClose()}
      role="presentation"
    >
      <div
        className="card-glow max-h-[min(92vh,880px)] w-full max-w-lg overflow-y-auto rounded-2xl border-2 border-[#f1c40f]/45 bg-gradient-to-b from-[#1a1f2e] via-[#12151f] to-[#0c0e14] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_32px_80px_rgba(0,0,0,0.55)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-export-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-7">
          <div className="mb-6 border-b border-white/10 pb-5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[#f1c40f]/90">{eyebrow}</p>
            <h2 id="match-export-modal-title" className="font-display text-2xl tracking-wide text-white sm:text-3xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-relaxed text-white/65">{description}</p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Vyber řez — vždy se stáhne jen jedna PNG (podobný princip jako u editoru nominace).
              </p>
            )}
          </div>

          <ul className="flex flex-col gap-2.5">
            {choices.map((c) => {
              const loading = busyKey === c.key;
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    disabled={busyKey !== null}
                    onClick={() => void onPick(c.key)}
                    className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-left transition-colors hover:border-[#f1c40f]/35 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-display text-sm font-black uppercase tracking-wide text-white">{c.title}</span>
                      <span className="shrink-0 font-display text-[11px] font-bold uppercase tracking-wider text-[#f1c40f]/80">
                        {loading ? "…" : "Stáhnout"}
                      </span>
                    </span>
                    {c.hint ? <p className="mt-2 text-[11px] leading-snug text-white/45">{c.hint}</p> : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={onClose}
            disabled={busyKey !== null}
            className="mt-6 w-full rounded-xl border border-white/12 py-2.5 text-sm text-white/65 transition-colors hover:border-white/25 hover:text-white disabled:opacity-50"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
