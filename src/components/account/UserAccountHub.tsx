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
          NaÄŤĂ­tĂˇmâ€¦
        </div>
      </FifaAppPage>
    );
  }

  if (status === "unauthenticated") {
    return (
      <FifaAppPage>
        <div className="mx-auto flex h-full min-h-0 max-w-lg flex-col items-center justify-center px-2 text-center">
          <p className={FIFA_KICKER}>ĂšÄŤet</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-[var(--fifa-text)]">MĹŻj ĂşÄŤet</h1>
          <p className="mt-3 text-sm text-[var(--fifa-text-secondary)]">
            Pro pĹ™ehled sestav a ĂşÄŤasti v soutÄ›Ĺľi se pĹ™ihlas pĹ™es Google.
          </p>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/ucet" })}
            className={`mt-8 ${FIFA_BTN_PRIMARY}`}
          >
            PĹ™ihlĂˇsit se pĹ™es Google
          </button>
          <p className="mt-6 text-sm text-[var(--fifa-text-muted)]">
            <Link href="/editorsestavy" className={FIFA_LINK}>
              Editor sestavy
            </Link>{" "}
            mĹŻĹľeĹˇ zkouĹˇet i bez ĂşÄŤtu â€” uloĹľenĂ­ vyĹľaduje pĹ™ihlĂˇĹˇenĂ­.
          </p>
        </div>
      </FifaAppPage>
    );
  }

  const welcomeName = session?.user?.name ?? "HrĂˇÄŤ";

  return (
    <FifaAppPage fillMobile className="!py-2 lg-device:!py-3">
      <div className="fifa-account-page flex min-h-0 flex-1 flex-col">
        <div className="fifa-account-page__header shrink-0">
          <div className="fifa-account-page__identity min-w-0">
            <h1 className="fifa-account-page__title">MĹŻj ĂşÄŤet</h1>
            <p className="fifa-account-page__welcome">
              <span className="fifa-account-page__welcome-line">
                VĂ­tej zpÄ›t, <span className="fifa-account-page__welcome-name">{welcomeName}</span>
              </span>
              {session?.user?.email ? (
                <span className="fifa-account-page__email-inline">{session.user.email}</span>
              ) : null}
            </p>
          </div>
          <div className="fifa-account-page__actions">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`${FIFA_BTN_SECONDARY} fifa-account-page__signout`}
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              OdhlĂˇsit
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

