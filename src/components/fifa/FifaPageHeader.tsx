import { FIFA_KICKER } from "@/lib/fifa/fifaUiClasses";

export function FifaPageHeader({
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
    <header className={`fifa-page-heading relative mb-6 shrink-0 pb-4 ${center ? "text-center" : ""}`}>
      <div className={`${center ? "mx-auto max-w-2xl" : "max-w-3xl"}`}>
        {kicker ? <p className={FIFA_KICKER}>{kicker}</p> : null}
        <h1 className={kicker ? "mt-1.5" : ""}>{title}</h1>
        {subtitle ? (
          <p className={`${center ? "mx-auto max-w-lg text-sm" : "max-w-2xl text-sm"}`}>{subtitle}</p>
        ) : null}
        <div className={`fifa-page-accent mt-4 ${center ? "mx-auto w-24" : "w-full max-w-xs"}`} aria-hidden />
      </div>
    </header>
  );
}
