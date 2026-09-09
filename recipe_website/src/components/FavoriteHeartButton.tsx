"use client";

import { trackCollectionCreated, trackRecipeFavorite } from "@/lib/analytics";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiHeart, FiX } from "react-icons/fi";

interface FavoriteHeartButtonProps {
  recipeId: string;
  recipeTitle: string;
}

export default function FavoriteHeartButton({
  recipeId,
  recipeTitle,
}: FavoriteHeartButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [collections, setCollections] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [membership, setMembership] = useState<Record<string, boolean>>({});
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [favPending, setFavPending] = useState(false);
  const [listPending, setListPending] = useState<Record<string, boolean>>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [cardRect, setCardRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [panelWidth, setPanelWidth] = useState<number>(288);
  const [anchorMode, setAnchorMode] = useState<"above" | "below">("below");

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        // Favorites status
        const favRes = await fetch("/api/favorites");
        if (favRes.ok) {
          const favData = await favRes.json();
          const favs: Array<{ recipeId: string }> = favData.favorites || [];
          if (mounted) {
            setIsFavorited(favs.some((f) => f.recipeId === recipeId));
          }
        }

        // Favorite lists
        const colRes = await fetch("/api/collections");
        if (colRes.ok) {
          const colData = await colRes.json();
          type RawCollection = { id?: unknown; name?: unknown };
          const raw: unknown[] = Array.isArray(colData.collections)
            ? colData.collections
            : [];
          const cols: Array<{ id: string; name: string }> = (
            raw as RawCollection[]
          ).map((c) => ({
            id: typeof c.id === "string" ? c.id : String(c.id ?? ""),
            name: typeof c.name === "string" ? c.name : String(c.name ?? ""),
          }));
          if (mounted) setCollections(cols);
          const entries: Record<string, boolean> = {};
          await Promise.all(
            cols.map(async (c) => {
              try {
                const mRes = await fetch(
                  `/api/collections/${
                    c.id
                  }/recipes?recipeId=${encodeURIComponent(recipeId)}`
                );
                if (mRes.ok) {
                  const mData = await mRes.json();
                  entries[c.id] = Boolean(mData.inCollection);
                }
              } catch {}
            })
          );
          if (mounted) setMembership(entries);
        }
      } catch {
        // ignore
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [recipeId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isSaved = useMemo(
    () => isFavorited || Object.values(membership).some(Boolean),
    [isFavorited, membership]
  );

  const openDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !showDialog;
    setShowDialog(next);
    if (next && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const panelHeightEstimate = 360;
      const margin = 8;
      const cardEl = buttonRef.current.closest("a") as HTMLElement | null;
      if (cardEl) {
        const cRect = cardEl.getBoundingClientRect();
        const navEl = document.querySelector("nav") as HTMLElement | null;
        const navBottom = navEl ? navEl.getBoundingClientRect().bottom : 0;
        setCardRect({
          top: cRect.top,
          left: cRect.left,
          width: cRect.width,
          height: cRect.height,
        });
        const isMobile = window.innerWidth < 640 || cRect.width < 320;
        const desired = isMobile
          ? Math.max(240, Math.min(360, cRect.width - margin * 2))
          : 320;
        setPanelWidth(desired);
        const willOverflowBelow =
          rect.bottom + margin + panelHeightEstimate >
          window.innerHeight - margin;
        setAnchorMode(willOverflowBelow ? "above" : "below");
        let top =
          (willOverflowBelow ? rect.top - panelHeightEstimate : rect.bottom) +
          margin;
        // Clamp within card bounds and below sticky nav
        const minTop = Math.max(cRect.top + margin, navBottom + margin);
        const maxTop = cRect.top + cRect.height - panelHeightEstimate - margin;
        top = Math.min(Math.max(top, minTop), maxTop);
        let left = rect.left;
        left = Math.min(
          cRect.left + cRect.width - desired - margin,
          Math.max(cRect.left + margin, left)
        );
        setPanelPos({ top, left });
      } else {
        setCardRect(null);
        const desired = 288;
        setPanelWidth(desired);
        const willOverflowBelow =
          rect.bottom + margin + panelHeightEstimate >
          window.innerHeight - margin;
        setAnchorMode(willOverflowBelow ? "above" : "below");
        const top =
          (willOverflowBelow ? rect.top - panelHeightEstimate : rect.bottom) +
          margin;
        const left = Math.min(
          window.innerWidth - desired - margin,
          Math.max(margin, rect.left)
        );
        setPanelPos({ top, left });
      }
    } else {
      setPanelPos(null);
      setCardRect(null);
    }
  };

  const toggleFavorite = async () => {
    if (favPending) return;
    try {
      setFavPending(true);
      const res = await fetch("/api/favorites", {
        method: isFavorited ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (res.ok) {
        setIsFavorited(!isFavorited);
        trackRecipeFavorite(
          recipeId,
          recipeTitle,
          isFavorited ? "remove" : "add"
        );
      }
    } catch {
    } finally {
      setFavPending(false);
    }
  };

  const toggleInCollection = async (collectionId: string) => {
    if (listPending[collectionId]) return;
    try {
      setListPending((prev) => ({ ...prev, [collectionId]: true }));
      const inCol = membership[collectionId];
      const res = await fetch(`/api/collections/${collectionId}/recipes`, {
        method: inCol ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (res.ok) {
        setMembership((prev) => ({ ...prev, [collectionId]: !inCol }));
      }
    } catch {
    } finally {
      setListPending((prev) => ({ ...prev, [collectionId]: false }));
    }
  };

  const createAndSaveList = async () => {
    if (!newListName.trim() || isCreating) return;
    try {
      setIsCreating(true);
      const createRes = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newListName.trim(),
          description: "",
          isPublic: false,
        }),
      });
      const data = await createRes.json();
      if (!createRes.ok) {
        throw new Error(data?.error || "Failed to create list");
      }
      const newId = data.collection?.id || data.id || String(Date.now());
      const newCol: { id: string; name: string } = {
        id: newId,
        name: newListName.trim(),
      };
      setCollections((prev) => [newCol, ...prev]);
      trackCollectionCreated(newId, newCol.name);
      const addRes = await fetch(`/api/collections/${newId}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (!addRes.ok) {
        const err = await addRes.json();
        throw new Error(err?.error || "Failed to save to new list");
      }
      setMembership((prev) => ({ ...prev, [newId]: true }));
      setNewListName("");
      setShowDialog(false);
    } catch {
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (!showDialog) return;
    let raf = 0;
    const handler = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const margin = 8;
        const panelHeightEstimate = 360;
        const cardEl = buttonRef.current.closest("a") as HTMLElement | null;
        if (cardEl) {
          const cRect = cardEl.getBoundingClientRect();
          const navEl = document.querySelector("nav") as HTMLElement | null;
          const navBottom = navEl ? navEl.getBoundingClientRect().bottom : 0;
          const isMobile = window.innerWidth < 640 || cRect.width < 320;
          const desired = isMobile
            ? Math.max(240, Math.min(360, cRect.width - margin * 2))
            : 320;
          setPanelWidth(desired);
          let top =
            (anchorMode === "above"
              ? rect.top - panelHeightEstimate
              : rect.bottom) + margin;
          // Clamp within card bounds and below sticky nav
          const minTop = Math.max(cRect.top + margin, navBottom + margin);
          const maxTop =
            cRect.top + cRect.height - panelHeightEstimate - margin;
          top = Math.min(Math.max(top, minTop), maxTop);
          let left = rect.left;
          left = Math.min(
            cRect.left + cRect.width - desired - margin,
            Math.max(cRect.left + margin, left)
          );
          setPanelPos({ top, left });
          setCardRect({
            top: cRect.top,
            left: cRect.left,
            width: cRect.width,
            height: cRect.height,
          });
        } else {
          const desired = 288;
          setPanelWidth(desired);
          const top =
            (anchorMode === "above"
              ? rect.top - panelHeightEstimate
              : rect.bottom) + margin;
          const left = Math.min(
            window.innerWidth - desired - margin,
            Math.max(margin, rect.left)
          );
          setPanelPos({ top, left });
          setCardRect(null);
        }
      });
    };
    window.addEventListener("resize", handler, { passive: true });
    window.addEventListener("scroll", handler, { passive: true });
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [showDialog, anchorMode]);
  return (
    <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        onClick={openDialog}
        className={`inline-flex items-center justify-center h-8 w-8 rounded-full border ${
          isSaved
            ? "bg-red-600 text-white border-red-600"
            : "bg-white/80 text-gray-700 border-gray-200 hover:bg-white"
        }`}
        aria-label="Choose favorite list"
        title="Choose favorite list"
      >
        <FiHeart className={`h-4 w-4 ${isSaved ? "" : "text-red-600"}`} />
      </button>

      {isClient &&
        showDialog &&
        panelPos &&
        cardRect &&
        createPortal(
          <>
            <div
              className="fixed z-[40] bg-black/20 backdrop-blur-sm"
              style={(function () {
                const navEl = document.querySelector(
                  "nav"
                ) as HTMLElement | null;
                const navBottom = navEl
                  ? navEl.getBoundingClientRect().bottom
                  : 0;
                const top = Math.max(cardRect.top, navBottom);
                const height = Math.max(
                  0,
                  cardRect.height - (top - cardRect.top)
                );
                return {
                  top,
                  left: cardRect.left,
                  width: cardRect.width,
                  height,
                };
              })()}
              onClick={() => setShowDialog(false)}
            />
            <div
              className="fixed z-[41] max-h-[80vh] bg-white rounded-md shadow-lg border border-gray-200 overflow-y-auto"
              style={{
                top: panelPos.top,
                left: panelPos.left,
                width: panelWidth,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Save to favorite list
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDialog(false);
                  }}
                  className="p-1 rounded hover:bg-gray-100"
                  aria-label="Close"
                >
                  <FiX className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="p-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite();
                  }}
                  disabled={favPending}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded border ${
                    isFavorited
                      ? "border-red-600 text-red-600"
                      : "border-gray-200 text-gray-700"
                  } ${favPending ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <span>Favorites</span>
                  <FiHeart
                    className={`h-4 w-4 ${
                      isFavorited ? "text-red-600" : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
              <div className="px-3 pb-3 space-y-2 max-h-56 overflow-y-auto">
                {collections.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleInCollection(c.id);
                    }}
                    disabled={Boolean(listPending[c.id])}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded border border-gray-200 hover:bg-gray-50 ${
                      listPending[c.id] ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <span>{c.name}</span>
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        membership[c.id] ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="New list name"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      createAndSaveList();
                    }}
                    disabled={isCreating || !newListName.trim()}
                    className="px-3 py-2 text-sm rounded-md bg-primary-600 text-white disabled:bg-gray-300"
                  >
                    Create & Save
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Link
                    href="/favLists"
                    className="flex-1 text-center text-xs px-3 py-2 rounded border hover:bg-gray-100"
                  >
                    Manage Lists
                  </Link>
                  <Link
                    href="/favLists/new"
                    className="flex-1 text-center text-xs px-3 py-2 rounded border hover:bg-gray-100"
                  >
                    New List
                  </Link>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
