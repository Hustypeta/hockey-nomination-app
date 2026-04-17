/**
 * Společné pozadí MS 2026 — ledová deska (shodná s `.squad-ice-fill` u dresů na /sestava).
 */
export function MsAmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="squad-ice-fill absolute inset-0" />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 100% 65% at 50% -18%, rgba(0, 48, 135, 0.22), transparent 56%),
            radial-gradient(ellipse 50% 45% at 0% 42%, rgba(200, 16, 46, 0.12), transparent 52%),
            radial-gradient(ellipse 48% 42% at 100% 58%, rgba(0, 180, 255, 0.08), transparent 48%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.028]"
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
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(180, 220, 235, 0.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180, 220, 235, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 35%, black 0%, transparent 72%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(200, 230, 240, 0.4) 1px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(180deg, black 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#020608]/55 via-transparent to-transparent"
        style={{ mixBlendMode: "multiply" }}
      />
    </div>
  );
}
