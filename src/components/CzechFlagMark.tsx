/**
 * Státní vlajka ČR — modrý klín u žerdi, nahoře bílé pole, dole červené (ne svislá trikolóra).
 * Poměr 3:2 dle zvyklostí.
 */
export function CzechFlagMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 30 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>Česká vlajka</title>
      <rect width="30" height="20" fill="#ffffff" />
      <rect y="10" width="30" height="10" fill="#d7141a" />
      <polygon points="0,0 15,10 0,20" fill="#11457e" />
    </svg>
  );
}
