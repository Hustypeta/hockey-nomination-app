import { CzechFlagMark } from "@/components/CzechFlagMark";
import { CzechHockeyCrest } from "@/components/CzechHockeyCrest";

export function SitePageHero({
  kicker,
  title,
  subtitle,
  align = "left",
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const center = align === "center";

  return (
    <header
      className={`
        relative mb-8 border-b border-white/[0.1] bg-gradient-to-b from-[#0a1224]/85 via-[#060a14]/55 to-transparent pb-8 pt-3 sm:pt-4
        ${center ? "text-center" : ""}
      `}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          background:
            "radial-gradient(ellipse 75% 85% at 18% 0%, rgba(200,16,46,0.45), transparent 52%), radial-gradient(ellipse 60% 65% at 88% 8%, rgba(0,48,135,0.4), transparent 50%)",
        }}
        aria-hidden
      />
      <div
        className={`relative mx-auto max-w-3xl px-4 sm:px-6 ${center ? "flex flex-col items-center" : ""}`}
      >
        <div
          className={`
            flex gap-3 sm:gap-4
            ${center ? "flex-col items-center sm:flex-row sm:justify-center sm:text-left" : "flex-col sm:flex-row sm:items-start"}
          `}
        >
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/12 bg-gradient-to-br from-[#0a1428]/95 to-[#05080f]/98 p-2 shadow-[0_0_28px_rgba(0,48,135,0.22),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <CzechHockeyCrest className="h-10 w-10 drop-shadow-[0_0_12px_rgba(200,16,46,0.25)] sm:h-11 sm:w-11" />
            <CzechFlagMark className="h-7 w-[4.2rem] rounded border border-white/10 shadow-sm sm:h-8 sm:w-[4.8rem]" />
          </div>
          <div className={`min-w-0 flex-1 ${center ? "max-w-2xl sm:max-w-none" : ""}`}>
            {kicker ? (
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.26em] text-[#f1c40f]/90 sm:text-[11px]">
                {kicker}
              </p>
            ) : null}
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2.35rem] lg:leading-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm leading-relaxed text-white/65 sm:text-base">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="nhl25-moje-sestava-accent mx-auto mt-6 h-1 w-full max-w-lg rounded-full opacity-[0.92]" aria-hidden />
      </div>
    </header>
  );
}
