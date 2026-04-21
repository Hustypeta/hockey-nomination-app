import Link from "next/link";

/**
 * Pick’em zatím bez serverového žebříčku — krátká informace + odkaz na bracket.
 * Až doplníš API, tady můžeš table/client fetch stejně jako u nominací.
 */
export function PickemLeaderboardSection() {
  return (
    <div>
      <p className="text-sm text-white/65">
        Tipovací bracket play-off MS — žebříček tipérů doplníme po skončení play-off (podle dostupnosti výsledků).
        Tipy si mezitím můžeš rozpracovat na stránce Pick’em.
      </p>
      <p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75">
        Žebříček Pick’em zatím není k dispozici — jakmile budou známé výsledky a nastavené bodování, zobrazí se tady.
      </p>
      <p className="mt-6 text-center text-sm">
        <Link href="/bracket" className="font-medium text-sky-300/95 underline-offset-4 hover:underline">
          Pick’em — bracket
        </Link>
      </p>
    </div>
  );
}
