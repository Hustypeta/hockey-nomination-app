"use client";

type AppLoadingScreenProps = {
  /** Krátký text pod nadpisem (např. „Načítám hráče…“). */
  message?: string;
};

/**
 * Jednotná celostránková obrazovka při načítání dat — sladěná s hlavičkou sestavovače.
 */
export function AppLoadingScreen({ message = "Načítám…" }: AppLoadingScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0e12]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, #003f87 0%, transparent 55%)",
        }}
      />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-[#2a3142] bg-[#151922]/90 px-8 py-12 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <div
            className="relative mb-8 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-2 border-[#003f87]/45 bg-[#003f87]/[0.08] shadow-[inset_0_0_24px_rgba(0,63,135,0.15)]"
            aria-hidden
          >
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#c41e3a]/90 border-r-[#003f87]/50 animate-spin [animation-duration:1.15s]" />
            <span className="relative z-10 font-display text-[10px] tracking-[0.2em] text-[#003f87]/90">
              ČR
            </span>
          </div>
          <h1 className="font-display text-3xl tracking-[0.12em] text-white md:text-4xl">
            MS 2026
          </h1>
          <p className="mt-1 font-display text-sm text-[#c41e3a]/90">Nominace</p>
          <div className="mt-8 flex items-center gap-3 text-white/55">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-[#003f87] animate-pulse"
              aria-hidden
            />
            <span className="text-sm tracking-wide">{message}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
