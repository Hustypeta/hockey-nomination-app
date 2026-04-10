"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import { toPng } from "html-to-image";
import type { LineupStructure } from "@/types";
import { encodeSharePayload } from "@/lib/sharePayload";
import { sharePngDataUrl } from "@/lib/sharePosterImage";

const POSTER_PNG_OPTS = {
  quality: 1,
  pixelRatio: 2 as const,
  backgroundColor: "#0c0e12",
};

const ENTRY_GAME_URL = process.env.NEXT_PUBLIC_VSTOUPIT_DO_HRY_URL ?? "#";

interface SaveShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  posterRef: React.RefObject<HTMLDivElement | null>;
  isAuthenticated: boolean;
  lineupStructure: LineupStructure;
  captainId: string | null;
  onSave: () => Promise<string | null>;
  isSaving: boolean;
}

export function SaveShareModal({
  isOpen,
  onClose,
  posterRef,
  isAuthenticated,
  lineupStructure,
  captainId,
  onSave,
  isSaving,
}: SaveShareModalProps) {
  const [shareBusy, setShareBusy] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const guestShareUrl = useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/share?z=${encodeSharePayload({
            v: 1,
            captainId,
            lineupStructure,
          })}`
        : "",
    [captainId, lineupStructure]
  );

  const linkToShow = useMemo(() => {
    if (typeof window === "undefined") return "";
    if (savedId) return `${window.location.origin}/nominations/${savedId}`;
    return guestShareUrl;
  }, [guestShareUrl, savedId]);

  const sharePosterAsImage = async (linkUrl: string | undefined) => {
    if (!posterRef.current) return;
    setShareBusy(true);
    setShareHint(null);
    try {
      const dataUrl = await toPng(posterRef.current, POSTER_PNG_OPTS);
      const result = await sharePngDataUrl(dataUrl, {
        filename: `ms2026-nominace-${savedId ?? "share"}.png`,
        title: "MS 2026 – nominace",
        text: "Moje nominace na MS v hokeji 2026",
        url: linkUrl,
      });
      if (result.ok && result.method === "clipboard") {
        setShareHint(
          "Obrázek je ve schránce – v Instagramu vytvoř příspěvek a vlož ho (Ctrl+V). U Stories dej vložit nálepku z galerie."
        );
      } else if (!result.ok && result.reason === "cancelled") {
        /* uživatel zavřel dialog */
      } else if (!result.ok) {
        setShareHint("Tady nejde obrázek přímo poslat – zkopíruj odkaz níže.");
      }
    } catch (err) {
      console.error(err);
      setShareHint("Generování obrázku se nepovedlo. Zkus to znovu.");
    } finally {
      setShareBusy(false);
    }
  };

  const handleShareLink = async () => {
    const url = linkToShow || guestShareUrl;
    if (!url) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "MS 2026 – nominace",
          text: "Podívej se na moji nominaci.",
          url,
        });
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    const url = linkToShow || guestShareUrl;
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNomination = async () => {
    const id = await onSave();
    if (id) setSavedId(id);
  };

  const handleClose = () => {
    setSavedId(null);
    setShareHint(null);
    onClose();
  };

  if (!isOpen) return null;

  const linkForImage = linkToShow || guestShareUrl || undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="card-glow w-full max-w-md rounded-2xl border-2 border-[#c41e3a] bg-[#151922] p-6">
        <h2 className="mb-5 font-display text-2xl text-white">Sdílet nominaci</h2>

        {shareHint && (
          <p className="mb-3 rounded-lg border border-amber-700/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-200/90">
            {shareHint}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleShareLink}
            className="w-full rounded-lg bg-[#003f87] py-3 font-display text-lg text-white transition-colors hover:bg-[#004a9e]"
          >
            Sdílet odkaz
          </button>
          <button
            type="button"
            onClick={() => sharePosterAsImage(linkForImage)}
            disabled={shareBusy}
            className="w-full rounded-lg bg-[#c41e3a] py-3 font-display text-lg text-white transition-colors hover:bg-[#a01830] disabled:opacity-50"
          >
            {shareBusy ? "Připravuji obrázek…" : "Sdílet obrázek"}
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            readOnly
            value={linkToShow || guestShareUrl}
            className="flex-1 truncate rounded-lg border border-[#2a3142] bg-[#0c0e12] px-3 py-2 text-xs text-white"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="whitespace-nowrap rounded-lg bg-[#003087] px-4 py-2 text-sm text-white transition-colors hover:bg-[#0040a8]"
          >
            {copied ? "Zkopírováno!" : "Kopírovat"}
          </button>
        </div>

        {isAuthenticated && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={handleSaveNomination}
              disabled={isSaving || !!savedId}
              className="w-full rounded-lg border-2 border-[#2a3142] py-2.5 font-display text-sm text-white transition-colors hover:border-[#c41e3a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savedId ? "Nominace uložena u účtu" : isSaving ? "Ukládám…" : "Uložit nominaci k účtu"}
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: window.location.href })}
              className="w-full rounded-lg border-2 border-[#2a3142] py-3 font-display text-white transition-colors hover:border-[#c41e3a]"
            >
              Přihlásit se přes Google
            </button>
            <a
              href={ENTRY_GAME_URL}
              className="w-full rounded-lg bg-gradient-to-r from-[#c8102e] to-[#8a0b22] py-3 text-center font-display text-lg text-white shadow-lg shadow-[#c8102e]/20 transition-opacity hover:opacity-95"
            >
              Vstoupit do hry
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="mt-4 w-full rounded-lg border border-[#2a3142] py-2 text-sm text-white/80 transition-colors hover:border-white/40"
        >
          Zavřít
        </button>
      </div>
    </div>
  );
}
