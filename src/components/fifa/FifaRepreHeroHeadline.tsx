/** Vycentrovaný hero nadpis — hlavní titulek + volitelný sezónní řádek pod ním. */
export function FifaRepreHeroHeadline({
  title,
  subtitle,
  as: Tag = "h2",
}: {
  title: string;
  subtitle?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="fifa-repre-hero-headline--stacked">
      <Tag className="fifa-repre-hero-title">{title}</Tag>
      {subtitle ? <p className="fifa-repre-hero-subtitle">{subtitle}</p> : null}
    </div>
  );
}
