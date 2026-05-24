"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/SiteHeader";

export function AdminPasswordLoginForm({
  title,
  description,
  onLoggedIn,
}: {
  title: string;
  description: string;
  onLoggedIn: () => void | Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Přihlášení selhalo.");
        return;
      }
      setPassword("");
      toast.success("Přihlášeno.");
      await onLoggedIn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sestava-page-ambient min-h-screen pb-24 text-white">
      <div className="sticky top-0 z-40">
        <SiteHeader />
      </div>
      <div className="relative z-10 mx-auto max-w-md px-4 py-16">
        <div className="sestava-premium-panel-dark rounded-2xl p-6 shadow-xl">
          <h1 className="font-sans text-xl font-bold leading-snug tracking-normal text-white">{title}</h1>
          <p className="mt-2 text-sm text-white/65">{description}</p>
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-3">
            <label className="block text-xs font-medium uppercase tracking-wider text-white/50">
              Admin heslo
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none ring-cyan-500/40 focus:ring-2"
              />
            </label>
            <button
              type="submit"
              disabled={busy || !password}
              className="w-full rounded-xl bg-gradient-to-r from-[#c8102e] to-[#003087] py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              {busy ? "Přihlašuji…" : "Přihlásit"}
            </button>
          </form>
          <p className="mt-4 text-[11px] leading-snug text-white/45">
            Stejné heslo jako u adminu oficiální soupisky. Na Railway musí být nastavené{" "}
            <span className="font-mono text-white/55">CONTEST_ADMIN_SECRET</span> a{" "}
            <span className="font-mono text-white/55">CONTEST_ADMIN_PASSWORD</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
