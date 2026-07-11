"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { useState } from "react";
import type { AccountHubSectionId } from "@/components/account/accountHubTypes";
import { AccountCollectionsSection } from "@/components/account/AccountCollectionsSection";
import { AccountContestsSection } from "@/components/account/AccountContestsSection";
import { AccountHubNav } from "@/components/account/AccountHubNav";
import { AccountLineupsSection } from "@/components/account/AccountLineupsSection";
import { AccountSettingsSection } from "@/components/account/AccountSettingsSection";
import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { FIFA_BTN_PRIMARY, FIFA_BTN_SECONDARY, FIFA_KICKER, FIFA_LINK } from "@/lib/fifa/fifaUiClasses";

function AccountSectionPanel({ section }: { section: AccountHubSectionId }) {
  switch (section) {
    case "lineups":
      return <AccountLineupsSection />;
    case "contests":
      return <AccountContestsSection />;
    case "collections":
      return <AccountCollectionsSection />;
    case "settings":
      return <AccountSettingsSection />;
    default:
      return <AccountLineupsSection />;
  }
}

export function UserAccountHub() {
  const { data: session, status } = useSession();
  const [section, setSection] = useState<AccountHubSectionId>("lineups");

  if (status === "loading") {
    return (
      <FifaAppPage fillMobile>
        <div className="flex h-full min-h-0 flex-1 items-center justify-center text-[var(--fifa-text-muted)]">
          Načítám…
        </div>
      </FifaAppPage>
    );
  }

  if (status === "unauthenticated") {
    return (
      <FifaAppPage>
        <div className="mx-auto flex h-full min-h-0 max-w-lg flex-col items-center justify-center px-2 text-center">
          <p className={FIFA_KICKER}>Účet</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-[var(--fifa-text)]">Můj účet</h1>
          <p className="mt-3 text-sm text-[var(--fifa-text-secondary)]">
            Pro přehled sestav a účasti v soutěži se přihlas přes Google.
          </p>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/ucet" })}
            className={`mt-8 ${FIFA_BTN_PRIMARY}`}
          >
            Přihlásit se přes Google
          </button>
          <p className="mt-6 text-sm text-[var(--fifa-text-muted)]">
            <Link href="/zapasy/sestava" className={FIFA_LINK}>
              Editor sestavy
            </Link>{" "}
            můžeš zkoušet i bez účtu — uložení vyžaduje přihlášení.
          </p>
        </div>
      </FifaAppPage>
    );
  }

  const welcomeName = session?.user?.name ?? "Hráč";

  return (
    <FifaAppPage fillMobile className="!py-2 lg:!py-3">
      <div className="fifa-account-page flex min-h-0 flex-1 flex-col">
        <div className="fifa-account-page__header shrink-0">
          <div className="min-w-0">
            <h1 className="fifa-account-page__title">Můj účet</h1>
            <p className="fifa-account-page__welcome">
              Vítej zpět, <span>{welcomeName}</span>
              {session?.user?.email ? (
                <>
                  {" "}
                  · <span className="fifa-account-page__email-inline">{session.user.email}</span>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`${FIFA_BTN_SECONDARY} flex items-center gap-1.5`}
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Odhlásit
            </button>
          </div>
        </div>

        <div className="fifa-account-page__shell min-h-0 flex-1">
          <AccountHubNav active={section} onChange={setSection} />
          <div className="fifa-account-page__panel min-h-0">
            <AccountSectionPanel section={section} />
          </div>
        </div>
      </div>
    </FifaAppPage>
  );
}
