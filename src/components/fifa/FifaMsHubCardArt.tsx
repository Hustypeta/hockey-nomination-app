import { FifaImageTextScrim } from "@/components/fifa/FifaImageTextScrim";

/** Pozadí karty MS — logo na celé ploše nebo v pravém panelu + scrim pro text. */
export function FifaMsHubCardArt({
  src,
  tournament,
  accentColor,
  accentSecondary,
  layout = "panel",
  className = "",
}: {
  src: string;
  /** Pro turnajové styly karty (`2026` / `2027`). */
  tournament: "2026" | "2027";
  accentColor: string;
  accentSecondary: string;
  /** `full` — logo přes celou kartu; `panel` — logo vpravo. */
  layout?: "full" | "panel";
  className?: string;
}) {
  const fullBleed = layout === "full";

  return (
    <div
      className={`fifa-ms-hub-card-art pointer-events-none absolute inset-0 overflow-hidden ${
        fullBleed ? "fifa-ms-hub-card-art--full" : ""
      } ${className}`.trim()}
      data-tournament={tournament}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background: fullBleed
            ? `radial-gradient(ellipse 120% 100% at 72% 50%, ${accentColor}22 0%, var(--fifa-bg-elevated) 58%)`
            : undefined,
        }}
      />
      {!fullBleed ? <div className="absolute inset-0 bg-[var(--fifa-bg-elevated)]" /> : null}

      {fullBleed ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 90% 85% at 68% 48%, ${accentColor}30 0%, transparent 62%), radial-gradient(ellipse 55% 45% at 12% 88%, ${accentSecondary}14 0%, transparent 58%)`,
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="fifa-ms-hub-card-art__logo absolute inset-0 h-full w-full scale-[1.28] object-cover object-center brightness-[1.04] saturate-[1.06]"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <FifaImageTextScrim variant="hero-left" />
        </>
      ) : (
        <>
          <div className="fifa-ms-hub-card-art__poster absolute inset-y-0 right-0 w-[42%] min-w-[7.5rem] max-w-[11.5rem] sm:w-[40%] sm:max-w-[12.5rem]">
            <div
              className="absolute inset-0 opacity-90"
              style={{
                background: `linear-gradient(165deg, ${accentColor}14 0%, rgba(255,255,255,0.02) 38%, ${accentSecondary}12 100%)`,
              }}
            />
            <div className="absolute inset-y-3 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <div
              className="absolute left-1/2 top-1/2 h-[62%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
              style={{ background: `radial-gradient(circle, ${accentColor}28 0%, transparent 72%)` }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="fifa-ms-hub-card-art__logo absolute left-1/2 top-1/2 max-h-[76%] max-w-[86%] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)]"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
          <FifaImageTextScrim variant="panel-left" />
          <div
            className="absolute bottom-0 left-0 h-[42%] w-[55%] opacity-80"
            style={{
              background: `radial-gradient(ellipse 90% 100% at 0% 100%, ${accentSecondary}12 0%, transparent 70%)`,
            }}
          />
        </>
      )}
    </div>
  );
}

export function FifaMs2026HubCardArt(props: { className?: string }) {
  return (
    <FifaMsHubCardArt
      src="/images/souteze-ms-2026.png?v=4"
      tournament="2026"
      accentColor="#e1061b"
      accentSecondary="#38bdf8"
      layout="full"
      {...props}
    />
  );
}

export function FifaMs2027HubCardArt(props: { className?: string }) {
  return (
    <FifaMsHubCardArt
      src="/images/souteze-ms-2027.png?v=4"
      tournament="2027"
      accentColor="#dd0000"
      accentSecondary="#ffcc00"
      layout="full"
      {...props}
    />
  );
}
