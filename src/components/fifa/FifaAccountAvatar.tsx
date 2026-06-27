"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";

function userInitials(user: { name?: string | null; email?: string | null }): string {
  const n = user.name?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]?.[0] ?? "";
      const b = parts[parts.length - 1]?.[0] ?? "";
      return `${a}${b}`.toUpperCase() || "?";
    }
    return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
  }
  const e = user.email?.trim();
  return (e?.slice(0, 2) ?? "?").toUpperCase();
}

export function FifaAccountAvatar() {
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div
        className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[var(--fifa-bg-hover)] ring-2 ring-[var(--fifa-border)] lg:h-9 lg:w-9"
        aria-hidden
      />
    );
  }

  return (
    <Link
      href="/ucet"
      className="group/avatar flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-[var(--fifa-border)] transition hover:ring-[var(--fifa-accent)]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fifa-accent)]/60 lg:h-9 lg:w-9"
      title={user?.name ?? user?.email ?? "Můj účet"}
      aria-label="Můj účet"
    >
      {user?.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- Google avatar URL
        <img
          src={user.image}
          alt=""
          width={36}
          height={36}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition group-hover/avatar:brightness-110"
        />
      ) : user ? (
        <span className="flex h-full w-full items-center justify-center bg-[var(--fifa-accent-muted)] text-[10px] font-bold text-[var(--fifa-text)] lg:text-xs">
          {userInitials(user)}
        </span>
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-[var(--fifa-bg-surface)] text-[var(--fifa-text-muted)]">
          <User className="h-4 w-4 lg:h-[1.125rem] lg:w-[1.125rem]" aria-hidden />
        </span>
      )}
    </Link>
  );
}
