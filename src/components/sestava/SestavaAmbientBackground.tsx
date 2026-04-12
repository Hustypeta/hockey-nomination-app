/**
 * Pozadí výhradně pro /sestava — hluboký gradient, jemný „ledový“ raster a náznak trikolory.
 */
export function SestavaAmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Základní hloubka: #05080f → #0f172a */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(165deg, #05080f 0%, #0a1224 38%, #0f172a 72%, #0c1428 100%)
          `,
        }}
      />
      {/* Modrá / červená záře — vyšší kontrast než plochá tma */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background: `
            radial-gradient(ellipse 120% 70% at 50% -20%, rgba(0, 48, 135, 0.38), transparent 55%),
            radial-gradient(ellipse 55% 50% at 0% 40%, rgba(200, 16, 46, 0.16), transparent 52%),
            radial-gradient(ellipse 50% 45% at 100% 60%, rgba(59, 130, 246, 0.12), transparent 48%)
          `,
        }}
      />
      {/* Extrémně jemná trikolora (diagonála) */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          background: `
            repeating-linear-gradient(
              125deg,
              #c8102e 0px,
              #c8102e 120px,
              #f8fafc 120px,
              #f8fafc 240px,
              #003087 240px,
              #003087 360px
            )
          `,
        }}
      />
      {/* Jemný ledový raster */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 35%, black 0%, transparent 72%)",
        }}
      />
      {/* „Pukové“ tečky — velmi subtilní */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(241,196,15,0.35) 1px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(180deg, black 0%, transparent 70%)",
        }}
      />
      {/* Spodní vigneta */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
        style={{ mixBlendMode: "multiply" }}
      />
    </div>
  );
}
