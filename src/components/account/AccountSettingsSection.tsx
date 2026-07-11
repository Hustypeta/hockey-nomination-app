"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FIFA_BTN_PRIMARY, FIFA_INPUT } from "@/lib/fifa/fifaUiClasses";

export function AccountSettingsSection() {
  const { status } = useSession();
  const [nickname, setNickname] = useState("");
  const [loadedNickname, setLoadedNickname] = useState(false);
  const [savingNick, setSavingNick] = useState(false);
  const [effectiveDisplayName, setEffectiveDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || loadedNickname) return;
    fetch("/api/account/leaderboard-nickname")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((d: { nickname?: unknown; displayName?: unknown }) => {
        setNickname(typeof d.nickname === "string" ? d.nickname : "");
        setLoadedNickname(true);
        setEffectiveDisplayName(typeof d.displayName === "string" ? d.displayName : null);
      })
      .catch(() => {
        setLoadedNickname(true);
      });
  }, [status, loadedNickname]);

  return (
    <section className="fifa-account-section">
      <div className="fifa-account-section__head">
        <div>
          <h2 className="fifa-account-section__title">Nastavení účtu</h2>
          <p className="fifa-account-section__desc">Přezdívka veřejného žebříčku a soukromí</p>
        </div>
      </div>

      <div className="fifa-account-settings-panel fifa-card">
        <div className="fifa-account-settings-panel__block">
          <label className="fifa-account-settings__label" htmlFor="account-nickname">
            Přezdívka
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
            <input
              id="account-nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).form?.requestSubmit();
              }}
              placeholder="např. PetrH"
              maxLength={24}
              className={`${FIFA_INPUT} min-w-0 flex-1`}
              autoComplete="off"
            />
            <button
              type="button"
              disabled={savingNick}
              onClick={() => {
                if (savingNick) return;
                setSavingNick(true);
                fetch("/api/account/leaderboard-nickname", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ nickname }),
                })
                  .then(async (r) => {
                    const d = (await r.json().catch(() => ({}))) as {
                      error?: unknown;
                      displayName?: unknown;
                      nickname?: unknown;
                    };
                    if (!r.ok) {
                      throw new Error(typeof d.error === "string" ? d.error : "Uložení se nepovedlo.");
                    }
                    setEffectiveDisplayName(typeof d.displayName === "string" ? d.displayName : null);
                    setNickname(typeof d.nickname === "string" ? d.nickname : "");
                    toast.success("Přezdívka uložena.");
                  })
                  .catch((e: unknown) => {
                    toast.error(e instanceof Error ? e.message : "Uložení se nepovedlo.");
                  })
                  .finally(() => setSavingNick(false));
              }}
              className={`${FIFA_BTN_PRIMARY} shrink-0`}
            >
              {savingNick ? "Ukládám…" : "Uložit"}
            </button>
          </div>
          {effectiveDisplayName ? (
            <p className="mt-2 text-xs text-[var(--fifa-text-muted)]">
              Ve žebříčku:{" "}
              <span className="font-semibold text-[var(--fifa-accent-text)]">{effectiveDisplayName}</span>
            </p>
          ) : (
            <p className="mt-2 text-xs text-[var(--fifa-text-muted)]">2–24 znaků · zobrazuje se ve veřejném žebříčku</p>
          )}
        </div>

        <div className="fifa-account-settings-panel__block fifa-account-settings-panel__block--divider">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--fifa-text)]">
            <Shield className="h-4 w-4 text-[var(--fifa-accent-text)]" aria-hidden />
            Ochrana osobních údajů
          </div>
          <p className="mt-2 text-sm text-[var(--fifa-text-secondary)]">
            Informace o zpracování dat a tvých právech.
          </p>
          <Link
            href="/ochrana-osobnich-udaju"
            className="mt-3 inline-flex text-sm text-[var(--fifa-accent-text)] hover:underline"
          >
            Zobrazit zásady ochrany osobních údajů →
          </Link>
        </div>
      </div>
    </section>
  );
}
