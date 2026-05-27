const FROST_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)' opacity='0.55'/%3E%3C/svg%3E\")";

const ARENA_PHOTO = "/images/promo/pozadi.png";

/**
 * Celostránkové pozadí — fotka arény + tmavé vignety a jemný ledový šum.
 * Fixed pod obsahem — jedna instance v root layoutu.
 */
export function FrozenArenaAmbientBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05060f] ${className}`}
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-center sm:bg-fixed"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(5,7,15,0.52) 0%, rgba(5,7,15,0.28) 40%, rgba(5,7,15,0.75) 72%, rgba(5,7,15,0.94) 100%), url("${ARENA_PHOTO}")`,
          backgroundPosition: "center 58%",
        }}
      />

      <div
        className="ms-fantasy-arena-lights pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[min(140vw,72rem)] -translate-x-1/2 rounded-[100%] opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(180, 240, 255, 0.22) 0%, rgba(0, 160, 220, 0.08) 38%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 right-[8%] h-72 w-72 rounded-full blur-3xl opacity-60"
        style={{ background: "radial-gradient(circle, rgba(200, 16, 46, 0.18), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -top-20 left-[6%] h-64 w-64 rounded-full blur-3xl opacity-60"
        style={{ background: "radial-gradient(circle, rgba(0, 120, 200, 0.16), transparent 70%)" }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[min(42vh,360px)] bg-gradient-to-b from-black/55 via-black/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_18%,rgba(255,255,255,0.04),transparent_55%)]" />

      <div className="pointer-events-none absolute inset-y-0 left-0 w-[max(0.5rem,2vw)] bg-gradient-to-r from-black/55 via-slate-900/15 to-transparent sm:w-3 lg:w-14" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[max(0.5rem,2vw)] bg-gradient-to-l from-black/55 via-slate-900/15 to-transparent sm:w-3 lg:w-14" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(42vh,340px)] bg-gradient-to-t from-[#05060f] via-[#05060f]/88 to-transparent" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{ backgroundImage: FROST_NOISE, backgroundSize: "200px 200px" }}
      />
    </div>
  );
}
