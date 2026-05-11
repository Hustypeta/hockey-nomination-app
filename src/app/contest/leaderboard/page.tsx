import { redirect } from "next/navigation";

/** Starší URL — přesměrování na hlavní stránku žebříčku. */
export default function ContestLeaderboardRedirectPage() {
  redirect("/zebricek");
}