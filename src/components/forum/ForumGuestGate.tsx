"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { GoogleSignInRequiredModal } from "@/components/auth/GoogleSignInRequiredModal";
import { enableForumGuestSession, isForumGuestSession } from "@/lib/guestSession";

export function ForumGuestGate({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const [guestOk, setGuestOk] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setGuestOk(isForumGuestSession());
    setReady(true);
  }, []);

  if (status === "loading" || !ready) {
    return (
      <div className="flex h-full min-h-[40vh] items-center justify-center text-slate-500">
        Načítám fórum…
      </div>
    );
  }

  if (status === "authenticated" || guestOk) {
    return children;
  }

  return (
    <>
      <div className="flex h-full min-h-[40vh] items-center justify-center text-slate-500">
        Přihlášení
      </div>
      <GoogleSignInRequiredModal
        open
        onClose={() => router.push("/")}
        callbackUrl="/forum"
        onContinueAsGuest={() => {
          enableForumGuestSession();
          setGuestOk(true);
        }}
      />
    </>
  );
}
