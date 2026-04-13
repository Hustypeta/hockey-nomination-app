"use client";

/**
 * Dočasný placeholder pro /bracket — plná logika zůstává v {@link BracketPickemContent}.
 */
export function BracketPickemComingSoon() {
  return (
    <main className="relative z-10 flex min-h-[min(70vh,520px)] flex-col items-center justify-center px-4 pb-24 pt-12 sm:pb-28 sm:pt-16">
      <div className="flex flex-col items-center">
        <div className="relative mx-auto h-28 w-28" aria-hidden>
          <div className="absolute inset-0 rounded-full border-2 border-white/[0.08]" />
          <div
            className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#f1c40f] border-r-[#c8102e]/50"
            style={{ animationDuration: "1.15s" }}
          />
          <div className="absolute inset-[18%] rounded-full bg-gradient-to-br from-[#0f172a] to-[#05080f] shadow-[inset_0_0_24px_rgba(0,48,135,0.25)] ring-1 ring-white/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-lg font-bold text-[#f1c40f]/90">MS</span>
          </div>
        </div>

        <h1 className="mt-10 text-center font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Připravujeme
        </h1>

        <div className="nhl25-moje-sestava-accent mt-10 h-1 w-44 max-w-[85vw] rounded-full opacity-[0.85]" />
      </div>
    </main>
  );
}
