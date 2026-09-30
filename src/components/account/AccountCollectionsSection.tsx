"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bookmark, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { LineupPoolSwitcher } from "@/components/match/LineupPoolSwitcher";
import { PlayerPoolPanel } from "@/components/sestava/PlayerPoolPanel";
import { PlayerPreviewModal } from "@/components/sestava/PlayerPreviewModal";
import { DEFAULT_LINEUP_POOL } from "@/lib/lineupPools";
import { initJerseyNameDisambiguation, jerseyNameForPlayer } from "@/lib/jerseyDisplayName";
import { poolPositionSquareLabel } from "@/lib/poolPositionLabel";
import { FIFA_BTN_PRIMARY, FIFA_BTN_SECONDARY, FIFA_INPUT } from "@/lib/fifa/fifaUiClasses";
import type { Player } from "@/types";

type AlbumListItem = {
  id: string;
  name: string;
  playerCount: number;
  createdAt: string;
  updatedAt: string;
};

type AlbumPlayer = Player & { addedAt?: string };

export function AccountCollectionsSection() {
  const [albums, setAlbums] = useState<AlbumListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingCreate, setSavingCreate] = useState(false);

  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [activeAlbumName, setActiveAlbumName] = useState("");
  const [albumPlayers, setAlbumPlayers] = useState<AlbumPlayer[]>([]);
  const [savedPlayerIds, setSavedPlayerIds] = useState<string[]>([]);
  const [loadingAlbum, setLoadingAlbum] = useState(false);
  const [savingAlbum, setSavingAlbum] = useState(false);

  const [poolKey, setPoolKey] = useState<string>(DEFAULT_LINEUP_POOL);
  const [poolCounts, setPoolCounts] = useState<Record<string, number>>({});
  const [poolPlayers, setPoolPlayers] = useState<Player[]>([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [poolError, setPoolError] = useState<string | null>(null);
  const [previewPlayer, setPreviewPlayer] = useState<Player | null>(null);

  const loadAlbums = useCallback(async () => {
    setLoadingList(true);
    try {
      const r = await fetch("/api/player-albums", { cache: "no-store" });
      const data = (await r.json()) as { albums?: AlbumListItem[]; error?: string };
      if (!r.ok) {
        toast.error(data.error ?? "Alba se nenačetla.");
        return;
      }
      setAlbums(data.albums ?? []);
    } catch {
      toast.error("Alba se nenačetla.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadAlbums();
  }, [loadAlbums]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/players?meta=1")
      .then((r) => r.json())
      .then((data: { pools?: Record<string, number> }) => {
        if (!cancelled && data.pools) setPoolCounts(data.pools);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeAlbumId) return;
    let cancelled = false;
    setPoolLoading(true);
    setPoolError(null);
    fetch(`/api/players?pool=${encodeURIComponent(poolKey)}`)
      .then(async (r) => {
        const data = (await r.json()) as unknown;
        if (cancelled) return;
        if (!r.ok || (data && typeof data === "object" && !Array.isArray(data) && "error" in data)) {
          const err = data as { error?: string; hint?: string };
          setPoolPlayers([]);
          setPoolError(err.hint || err.error || "Nepodařilo se načíst hráče.");
          return;
        }
        const list = Array.isArray(data) ? (data as Player[]) : [];
        setPoolPlayers(list);
        initJerseyNameDisambiguation(list);
      })
      .catch(() => {
        if (!cancelled) {
          setPoolPlayers([]);
          setPoolError("Nepodařilo se načíst hráče.");
        }
      })
      .finally(() => {
        if (!cancelled) setPoolLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeAlbumId, poolKey]);

  const openAlbum = async (album: AlbumListItem) => {
    setActiveAlbumId(album.id);
    setActiveAlbumName(album.name);
    setLoadingAlbum(true);
    try {
      const r = await fetch(`/api/player-albums/${encodeURIComponent(album.id)}`, { cache: "no-store" });
      const data = (await r.json()) as {
        album?: { name: string; players: AlbumPlayer[] };
        error?: string;
      };
      if (!r.ok || !data.album) {
        toast.error(data.error ?? "Album se nenačetlo.");
        setActiveAlbumId(null);
        return;
      }
      setActiveAlbumName(data.album.name);
      setAlbumPlayers(data.album.players);
      setSavedPlayerIds(data.album.players.map((p) => p.id));
      initJerseyNameDisambiguation(data.album.players);
    } catch {
      toast.error("Album se nenačetlo.");
      setActiveAlbumId(null);
    } finally {
      setLoadingAlbum(false);
    }
  };

  const createAlbum = async () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Zadej jméno alba.");
      return;
    }
    setSavingCreate(true);
    try {
      const r = await fetch("/api/player-albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await r.json()) as { album?: AlbumListItem; error?: string };
      if (!r.ok || !data.album) {
        toast.error(data.error ?? "Album se neuložilo.");
        return;
      }
      setAlbums((prev) => [data.album!, ...prev]);
      setCreating(false);
      setNewName("");
      await openAlbum(data.album);
    } catch {
      toast.error("Album se neuložilo.");
    } finally {
      setSavingCreate(false);
    }
  };

  const deleteAlbum = async (albumId: string) => {
    if (!confirm("Smazat album?")) return;
    const r = await fetch(`/api/player-albums/${encodeURIComponent(albumId)}`, { method: "DELETE" });
    if (!r.ok) {
      toast.error("Smazání selhalo.");
      return;
    }
    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
    if (activeAlbumId === albumId) {
      setActiveAlbumId(null);
      setAlbumPlayers([]);
    }
  };

  const usedIds = useMemo(() => new Set(albumPlayers.map((p) => p.id)), [albumPlayers]);

  const isDirty = useMemo(() => {
    if (albumPlayers.length !== savedPlayerIds.length) return true;
    const saved = new Set(savedPlayerIds);
    return albumPlayers.some((p) => !saved.has(p.id));
  }, [albumPlayers, savedPlayerIds]);

  const addToAlbum = (player: Player) => {
    if (usedIds.has(player.id)) return;
    setAlbumPlayers((prev) => [...prev, { ...player, pick_rate: player.pick_rate ?? 0 }]);
  };

  const removeFromAlbum = (playerId: string) => {
    setAlbumPlayers((list) => list.filter((p) => p.id !== playerId));
  };

  const closeAlbumEditor = () => {
    setActiveAlbumId(null);
    setAlbumPlayers([]);
    setSavedPlayerIds([]);
    void loadAlbums();
  };

  const saveAlbum = async () => {
    if (!activeAlbumId) return;
    setSavingAlbum(true);
    try {
      const currentIds = new Set(albumPlayers.map((p) => p.id));
      const previousIds = new Set(savedPlayerIds);
      const toAdd = albumPlayers.filter((p) => !previousIds.has(p.id));
      const toRemove = savedPlayerIds.filter((id) => !currentIds.has(id));

      for (const player of toAdd) {
        const r = await fetch(`/api/player-albums/${encodeURIComponent(activeAlbumId)}/players`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId: player.id }),
        });
        if (!r.ok) {
          const data = (await r.json().catch(() => ({}))) as { error?: string };
          toast.error(data.error ?? "Uložení selhalo.");
          return;
        }
      }

      for (const playerId of toRemove) {
        const r = await fetch(
          `/api/player-albums/${encodeURIComponent(activeAlbumId)}/players/${encodeURIComponent(playerId)}`,
          { method: "DELETE" },
        );
        if (!r.ok) {
          toast.error("Uložení selhalo.");
          return;
        }
      }

      setSavedPlayerIds(albumPlayers.map((p) => p.id));
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === activeAlbumId ? { ...a, playerCount: albumPlayers.length } : a,
        ),
      );
      toast.success("Album uloženo.");
      closeAlbumEditor();
    } catch {
      toast.error("Uložení selhalo.");
    } finally {
      setSavingAlbum(false);
    }
  };

  if (activeAlbumId) {
    return (
      <section className="fifa-account-section fifa-account-collections">
        <div className="fifa-account-section__head">
          <div className="min-w-0">
            <button
              type="button"
              className="fifa-account-collections__back"
              onClick={() => {
                if (isDirty && !confirm("Máš neuložené změny. Odejít bez uložení?")) return;
                closeAlbumEditor();
              }}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Alba
            </button>
            <h2 className="fifa-account-section__title mt-2 truncate">{activeAlbumName}</h2>
            <p className="fifa-account-section__desc">{albumPlayers.length} hráčů</p>
          </div>
          <button
            type="button"
            className={FIFA_BTN_PRIMARY}
            disabled={savingAlbum || loadingAlbum}
            onClick={() => void saveAlbum()}
          >
            {savingAlbum ? "Ukládám…" : "Uložit"}
          </button>
        </div>

        {loadingAlbum ? (
          <p className="fifa-meta py-8 text-center">Načítám…</p>
        ) : (
          <div className="fifa-account-collections__editor">
            <div className="fifa-account-collections__pool">
              <LineupPoolSwitcher
                value={poolKey}
                onChange={setPoolKey}
                counts={poolCounts}
                size="compact"
              />
              <div className="fifa-account-collections__pool-body">
                {poolLoading ? (
                  <p className="fifa-meta py-6 text-center">Načítám hráče…</p>
                ) : (
                  <PlayerPoolPanel
                    players={poolPlayers}
                    usedIds={usedIds}
                    counts={{ G: 0, D: 0, F: 0 }}
                    onAddPlayer={addToAlbum}
                    onPreview={setPreviewPlayer}
                    enableDnd={false}
                    simplePickList
                    ignorePositionLimits
                    uiVariant="fifa"
                    gridColumns={2}
                    hidePickRate
                    emptyHint={poolError}
                  />
                )}
              </div>
            </div>

            <div className="fifa-account-collections__album">
              <div className="fifa-account-collections__album-head">
                <span>V albu</span>
                <strong>{albumPlayers.length}</strong>
              </div>
              {albumPlayers.length === 0 ? (
                <p className="fifa-account-collections__album-empty">
                  Klikni na hráče vlevo — přidá se sem. Pak dej Uložit.
                </p>
              ) : (
                <ul className="fifa-account-collections__album-list">
                  {albumPlayers.map((player) => (
                    <li key={player.id} className="fifa-account-collections__album-item">
                      <span className="fifa-account-collections__album-pos">
                        {poolPositionSquareLabel(player)}
                      </span>
                      <span className="fifa-account-collections__album-name">
                        {jerseyNameForPlayer(player)}
                      </span>
                      <button
                        type="button"
                        className="fifa-account-collections__album-remove"
                        aria-label={`Odebrat ${player.name}`}
                        onClick={() => removeFromAlbum(player.id)}
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <PlayerPreviewModal player={previewPlayer} onClose={() => setPreviewPlayer(null)} />
      </section>
    );
  }

  return (
    <section className="fifa-account-section fifa-account-collections">
      <div className="fifa-account-section__head">
        <div>
          <h2 className="fifa-account-section__title">Sbírky hráčů</h2>
          <p className="fifa-account-section__desc">Tvoje alba hráčů</p>
        </div>
        <button
          type="button"
          className={FIFA_BTN_PRIMARY}
          onClick={() => {
            setCreating(true);
            setNewName("");
          }}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Přidat album
        </button>
      </div>

      {creating ? (
        <div className="fifa-account-collections__create fifa-card">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--fifa-text-muted)]">
            Jméno alba
          </label>
          <input
            className={`${FIFA_INPUT} mt-2`}
            value={newName}
            maxLength={48}
            autoFocus
            placeholder="např. Favoriti A-týmu"
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void createAlbum();
            }}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={FIFA_BTN_PRIMARY}
              disabled={savingCreate}
              onClick={() => void createAlbum()}
            >
              {savingCreate ? "Ukládám…" : "Vytvořit"}
            </button>
            <button
              type="button"
              className={FIFA_BTN_SECONDARY}
              disabled={savingCreate}
              onClick={() => setCreating(false)}
            >
              Zrušit
            </button>
          </div>
        </div>
      ) : null}

      {loadingList ? (
        <p className="fifa-meta py-8 text-center">Načítám…</p>
      ) : albums.length === 0 && !creating ? (
        <div className="fifa-account-collections-placeholder fifa-card">
          <div className="fifa-account-collections-placeholder__icon" aria-hidden>
            <Bookmark className="h-8 w-8" />
          </div>
          <h3 className="fifa-account-collections-placeholder__title">Zatím žádné album</h3>
          <p className="fifa-account-collections-placeholder__text">
            Přidej album a pak do něj vybírej hráče z reprezentace nebo Tipsport extraligy.
          </p>
        </div>
      ) : (
        <ul className="fifa-account-collections__list">
          {albums.map((album) => (
            <li key={album.id}>
              <button
                type="button"
                className="fifa-account-collections__list-item"
                onClick={() => void openAlbum(album)}
              >
                <span className="fifa-account-collections__list-name">{album.name}</span>
                <span className="fifa-account-collections__list-count">{album.playerCount}</span>
              </button>
              <button
                type="button"
                className="fifa-account-collections__list-delete"
                aria-label={`Smazat ${album.name}`}
                onClick={() => void deleteAlbum(album.id)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
