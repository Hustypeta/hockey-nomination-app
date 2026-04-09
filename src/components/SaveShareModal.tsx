"use client";

import { useState } from "react";
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

const DEFAULT_APP_URL = "https://hockey-nomination-app-production.up.railway.app/sestava";

function shareTextWithUrl(url: string) {
  return `Tady je moje nominace na MS 2026! Co říkáš?

${url}

#MS2026 #Hokej #ČR #Nominace2026`;
}

interface SaveShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  posterRef: React.RefObject<HTMLDivElement | null>;
  /** Přihlášený uživatel – uložení do DB + stažení. Host jen odkaz v URL bez ukládání. */
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
  const [downloading, setDownloading] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const guestShareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share?z=${encodeSharePayload({
          v: 1,
          captainId,
          lineupStructure,
        })}`
      : "";

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
        setShareHint(
          "Tady nejde obrázek přímo poslat – zkopíruj odkaz níže, nebo se přihlas a stáhni plakát."
        );
      }
    } catch (err) {
      console.error(err);
      setShareHint("Generování obrázku se nepovedlo. Zkus to znovu.");
    } finally {
      setShareBusy(false);
    }
  };

  const handleDownload = async () => {
    if (!isAuthenticated || !posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, POSTER_PNG_OPTS);
      const link = document.createElement("a");
      link.download = `ms2026-nominace-${savedId || Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveNomination = async () => {
    const id = await onSave();
    if (!id) return;
    setSavedId(id);
  };

  const handleCopyGuestLink = async () => {
    await navigator.clipboard.writeText(guestShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySocialText = async (url: string) => {
    await navigator.clipboard.writeText(shareTextWithUrl(url));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySavedLink = async () => {
    if (!savedId) return;
    const url = `${window.location.origin}/nominations/${savedId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSavedId(null);
    setShareHint(null);
    onClose();
  };

  if (!isOpen) return null;

  const shareUrlAfterSave = savedId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/nominations/${savedId}`
    : "";

  // ——— Host: jen odkaz, žádné ukládání ani stažení ———
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-[#151922] border-2 border-[#c41e3a] rounded-2xl p-6 max-w-md w-full card-glow">
          <h2 className="font-display text-2xl text-white mb-2">Sdílet nominaci</h2>
          <p className="text-white/80 text-sm mb-3">
            <strong className="text-white">Instagram / Stories:</strong> nejlépe jako{" "}
            <strong className="text-white">fotku plakátu</strong> – odkaz se tam špatně vkládá. Použij
            tlačítko „Sdílet plakát jako obrázek“ (na mobilu otevře výběr aplikace).
          </p>
          <p className="text-white/80 text-sm mb-3">
            <strong className="text-white">Facebook, X, WhatsApp:</strong> můžeš poslat{" "}
            <strong className="text-white">odkaz</strong> – po uložení nominace (přihlášení) má odkaz
            hezký náhled. Host bez účtu má jen dlouhý odkaz (náhled nemusí vyjít).
          </p>
          <p className="text-white/70 text-sm mb-4">
            Bez přihlášení se nominace <strong className="text-white">nikde neukládá</strong> a{" "}
            <strong className="text-white">nejde stáhnout soubor</strong> do složky Stažené – pořád ale
            můžeš poslat obrázek přes sdílení nebo odkaz.
          </p>
          {shareHint && (
            <p className="text-amber-200/90 text-sm mb-3 border border-amber-700/50 rounded-lg px-3 py-2 bg-amber-950/40">
              {shareHint}
            </p>
          )}
          <div className="flex flex-col gap-3 mb-4">
            <button
              type="button"
              onClick={() => sharePosterAsImage(guestShareUrl)}
              disabled={shareBusy}
              className="w-full py-3 rounded-lg bg-[#c41e3a] text-white font-display text-lg hover:bg-[#a01830] disabled:opacity-50 transition-colors"
            >
              {shareBusy ? "Připravuji obrázek…" : "Sdílet plakát jako obrázek"}
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              readOnly
              value={guestShareUrl}
              className="flex-1 px-3 py-2 rounded-lg bg-[#0c0e12] border border-[#2a3142] text-white text-xs truncate"
            />
            <button
              type="button"
              onClick={handleCopyGuestLink}
              className="px-4 py-2 rounded-lg bg-[#003087] text-white hover:bg-[#0040a8] transition-colors whitespace-nowrap text-sm"
            >
              {copied ? "Zkopírováno!" : "Kopírovat odkaz"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleCopySocialText(guestShareUrl || DEFAULT_APP_URL)}
            className="mb-4 w-full rounded-lg border border-[#c8102e]/50 bg-[#c8102e]/10 py-2.5 text-sm text-white/90 hover:bg-[#c8102e]/20"
          >
            Kopírovat text pro X / Instagram / Facebook (+ hashtagy)
          </button>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: window.location.href })}
              className="w-full py-3 rounded-lg border-2 border-[#2a3142] text-white font-display hover:border-[#c41e3a] transition-colors"
            >
              Přihlásit se přes Google (ukládání + náhled u odkazu)
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="py-2 rounded-lg border border-[#2a3142] text-white/80 hover:border-white/40 text-sm transition-colors"
            >
              Zavřít
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ——— Přihlášený: uložení + stažení ———
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#151922] border-2 border-[#c41e3a] rounded-2xl p-6 max-w-md w-full card-glow">
        {!savedId ? (
          <>
            <h2 className="font-display text-2xl text-white mb-2">Uložit a sdílet</h2>
            <p className="text-white/80 text-sm mb-4">
              Nominace se uloží k tvému účtu (Google). Na sítě: ideálně{" "}
              <strong className="text-white">fotka plakátu</strong> (Instagram) nebo{" "}
              <strong className="text-white">odkaz</strong> s náhledem po uložení.
            </p>
            {shareHint && (
              <p className="text-amber-200/90 text-sm mb-3 border border-amber-700/50 rounded-lg px-3 py-2 bg-amber-950/40">
                {shareHint}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSaveNomination}
                disabled={isSaving}
                className="w-full py-3 rounded-lg bg-[#c41e3a] text-white font-display text-lg hover:bg-[#a01830] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? "Ukládám…" : "Uložit nominaci"}
              </button>
              <button
                type="button"
                onClick={() => sharePosterAsImage(undefined)}
                disabled={shareBusy}
                className="w-full py-3 rounded-lg bg-[#003f87] text-white font-display text-lg hover:bg-[#004a9e] disabled:opacity-50 transition-colors"
              >
                {shareBusy ? "Připravuji…" : "Sdílet plakát jako obrázek"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-3 rounded-lg border-2 border-[#003f87] text-white font-display text-lg hover:bg-[#003f87]/20 disabled:opacity-50 transition-colors"
              >
                {downloading ? "Generuji obrázek…" : "Stáhnout plakát (PNG)"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-2 rounded-lg border border-[#2a3142] text-white/80 hover:border-white/40 text-sm transition-colors"
              >
                Zavřít
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl text-white mb-2">Nominace uložena</h2>
            <p className="text-white/80 text-sm mb-4">
              Odkaz níže má na Facebooku / ve WhatsAppu náhled. Na Instagram pošli radši obrázek
              tlačítkem „Sdílet plakát jako obrázek“.
            </p>
            {shareHint && (
              <p className="text-amber-200/90 text-sm mb-3 border border-amber-700/50 rounded-lg px-3 py-2 bg-amber-950/40">
                {shareHint}
              </p>
            )}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={shareUrlAfterSave}
                className="flex-1 px-3 py-2 rounded-lg bg-[#0c0e12] border border-[#2a3142] text-white text-sm truncate"
              />
              <button
                type="button"
                onClick={handleCopySavedLink}
                className="px-4 py-2 rounded-lg bg-[#003f87] text-white hover:bg-[#004a9e] transition-colors whitespace-nowrap"
              >
                {copied ? "Zkopírováno!" : "Kopírovat"}
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleCopySocialText(shareUrlAfterSave || DEFAULT_APP_URL)}
                className="w-full rounded-lg border border-[#c8102e]/50 bg-[#c8102e]/10 py-2.5 text-sm text-white/90 hover:bg-[#c8102e]/20"
              >
                Kopírovat text pro sítě (+ hashtagy)
              </button>
              <button
                type="button"
                onClick={() => sharePosterAsImage(shareUrlAfterSave)}
                disabled={shareBusy}
                className="w-full py-3 rounded-lg bg-[#003f87] text-white font-display text-lg hover:bg-[#004a9e] disabled:opacity-50 transition-colors"
              >
                {shareBusy ? "Připravuji…" : "Sdílet plakát jako obrázek"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-3 rounded-lg bg-[#c41e3a] text-white font-display text-lg hover:bg-[#a01830] disabled:opacity-50 transition-colors"
              >
                {downloading ? "Generuji…" : "Stáhnout plakát (PNG)"}
              </button>
              <div className="flex gap-3">
                <a
                  href={shareUrlAfterSave}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-lg border-2 border-[#2a3142] text-white font-display text-center hover:border-[#c41e3a] transition-colors"
                >
                  Otevřít nominaci
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-3 rounded-lg border-2 border-[#2a3142] text-white hover:border-white/50 transition-colors"
                >
                  Hotovo
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
