export function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
              radial-gradient(ellipse 100% 60% at 50% -15%, rgba(0, 48, 135, 0.55), transparent 55%),
              radial-gradient(ellipse 70% 50% at 0% 40%, rgba(200, 16, 46, 0.18), transparent 50%),
              radial-gradient(ellipse 60% 45% at 100% 55%, rgba(0, 100, 200, 0.2), transparent 48%),
              linear-gradient(180deg, #0a1018 0%, #05080f 40%, #03050a 100%)
            `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
              linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)
            `,
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(180deg, black 0%, transparent 85%)",
        }}
      />
    </div>
  );
}
