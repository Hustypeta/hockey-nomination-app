import { redirect } from "next/navigation";

/** Starší URL — celý žebříček je na `/zebricek`. */
export default function ContestLeaderboardRedirectPage() {
  redirect("/zebricek");
}
