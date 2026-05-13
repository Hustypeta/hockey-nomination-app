const FROST_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)' opacity='0.55'/%3E%3C/svg%3E\")";

/**
 * Celostránkové „Frozen Arena“ pozadí (reflektory, tribuny, mantinely, led, šum).
 * Fixed pod obsahem — jedna instance v root layoutu.
 */
export function FrozenArenaAmbientBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#020408] ${className}`}
      aria-hidden
    >
      <div
        className="ms-fantasy-arena-lights pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[min(140vw,72rem)] -translate-x-1/2 rounded-[100%]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(180, 240, 255, 0.35) 0%, rgba(0, 160, 220, 0.12) 38%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 right-[8%] h-72 w-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(200, 16, 46, 0.22), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -top-20 left-[6%] h-64 w-64 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(0, 120, 200, 0.2), transparent 70%)" }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[min(52vh,420px)] bg-gradient-to-b from-black/75 via-black/35 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_18%,rgba(255,255,255,0.05),transparent_55%)]" />

      <div className="pointer-events-none absolute inset-y-0 left-0 w-[max(0.5rem,2vw)] bg-gradient-to-r from-black/70 via-slate-900/25 to-transparent sm:w-3 lg:w-14" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[max(0.5rem,2vw)] bg-gradient-to-l from-black/70 via-slate-900/25 to-transparent sm:w-3 lg:w-14" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-cyan-200/25 via-white/10 to-transparent opacity-60 lg:left-14" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-cyan-200/25 via-white/10 to-transparent opacity-60 lg:right-14" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(38vh,320px)] bg-gradient-to-t from-[#0a1824] via-[#0c1e2c]/92 to-transparent" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 opacity-[0.22] mix-blend-soft-light"
        style={{
          background:
            "repeating-linear-gradient(105deg, transparent, transparent 22px, rgba(255,255,255,0.05) 22px, rgba(255,255,255,0.05) 23px), repeating-linear-gradient(-18deg, transparent, transparent 40px, rgba(0,80,120,0.06) 40px, rgba(0,80,120,0.06) 41px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cyan-300/10 to-transparent opacity-50"
        style={{ maskImage: "linear-gradient(to top, black, transparent)" }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: FROST_NOISE, backgroundSize: "200px 200px" }}
      />
    </div>
  );
}
