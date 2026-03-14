"use client";

import { useState } from "react";
import { toPng } from "html-to-image";

interface SaveShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  posterRef: React.RefObject<HTMLDivElement | null>;
  onSave: (email: string) => Promise<string | null>;
  isSaving: boolean;
}

export function SaveShareModal({
  isOpen,
  onClose,
  posterRef,
  onSave,
  isSaving,
}: SaveShareModalProps) {
  const [email, setEmail] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0c0e12",
      });
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

  const handleSaveAndShare = async () => {
    if (!email.trim()) return;
    const id = await onSave(email.trim());
    if (!id) return;
    setSavedId(id);
    await handleDownload();
  };

  const handleCopyLink = async () => {
    if (!savedId) return;
    const url = `${window.location.origin}/nominations/${savedId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSavedId(null);
    setEmail("");
    onClose();
  };

  if (!isOpen) return null;

  const shareUrl = savedId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/nominations/${savedId}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#151922] border-2 border-[#c41e3a] rounded-2xl p-6 max-w-md w-full card-glow">
        {!savedId ? (
          <>
            <h2 className="font-display text-2xl text-white mb-4">
              Uložit a Sdílet
            </h2>
            <p className="text-white/80 text-sm mb-4">
              Zadejte email pro uložení nominace. Po uložení se stáhne plakát a
              dostanete odkaz ke sdílení.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.cz"
              className="w-full px-4 py-3 rounded-lg bg-[#0c0e12] border-2 border-[#2a3142] text-white placeholder-white/40 focus:border-[#c41e3a] focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveAndShare}
                disabled={isSaving || !email.trim()}
                className="flex-1 py-3 rounded-lg bg-[#c41e3a] text-white font-display text-lg hover:bg-[#a01830] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving || downloading ? "..." : "Uložit a Stáhnout"}
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-3 rounded-lg border-2 border-[#2a3142] text-white hover:border-white/50 transition-colors"
              >
                Zrušit
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl text-white mb-2">
              Nominace uložena
            </h2>
            <p className="text-white/80 text-sm mb-4">
              Plakát se stáhl. Sdílej odkaz – na Facebooku, Twitteru nebo
              WhatsAppu se zobrazí hezký náhled.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 rounded-lg bg-[#0c0e12] border border-[#2a3142] text-white text-sm truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-lg bg-[#003f87] text-white hover:bg-[#004a9e] transition-colors whitespace-nowrap"
              >
                {copied ? "Zkopírováno!" : "Kopírovat"}
              </button>
            </div>
            <div className="flex gap-3">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-lg bg-[#c41e3a] text-white font-display text-lg hover:bg-[#a01830] text-center transition-colors"
              >
                Otevřít nominaci
              </a>
              <button
                onClick={handleClose}
                className="px-4 py-3 rounded-lg border-2 border-[#2a3142] text-white hover:border-white/50 transition-colors"
              >
                Hotovo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
