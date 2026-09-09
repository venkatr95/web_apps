"use client";

import { trackRecipeFavorite } from "@/lib/analytics";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiHeart, FiX } from "react-icons/fi";

interface SaveRecipeMenuProps {
  recipeId: string;
  recipeTitle: string;
}

interface Collection {
  id: string;
  name: string;
  isPublic: boolean;
}
interface FavoriteItem {
  recipeId: string;
}

export default function SaveRecipeMenu({
  recipeId,
  recipeTitle,
}: SaveRecipeMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [membership, setMembership] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        setLoading(true);
        // Get favorites to determine if this recipe is favorited
        const favRes = await fetch("/api/favorites", { method: "GET" });
        if (favRes.ok) {
          const favData = await favRes.json();
          const favs: FavoriteItem[] = favData.favorites || [];
          if (mounted) {
            setIsFavorited(favs.some((f) => f.recipeId === recipeId));
          }
        }
        // Get collections
        const colRes = await fetch("/api/collections", { method: "GET" });
        if (colRes.ok) {
          const colData = await colRes.json();
          type RawCollection = {
            id?: unknown;
            name?: unknown;
            isPublic?: unknown;
          };
          const raw: unknown[] = Array.isArray(colData.collections)
            ? colData.collections
            : [];
          const cols: Collection[] = (raw as RawCollection[]).map((c) => ({
            id: typeof c.id === "string" ? c.id : String(c.id ?? ""),
            name: typeof c.name === "string" ? c.name : String(c.name ?? ""),
            isPublic:
              typeof c.isPublic === "boolean"
                ? c.isPublic
                : Boolean(c.isPublic),
          }));
          if (mounted) {
            setCollections(cols);
          }
          // Check membership for each collection
          const entries: Record<string, boolean> = {};
          await Promise.all(
            cols.map(async (c) => {
              const mRes = await fetch(
                `/api/collections/${c.id}/recipes?recipeId=${encodeURIComponent(
                  recipeId
                )}`
              );
              if (mRes.ok) {
                const mData = await mRes.json();
                entries[c.id] = Boolean(mData.inCollection);
              }
            })
          );
          if (mounted) setMembership(entries);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [recipeId]);

  const toggleFavorite = async () => {
    try {
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
        router.refresh();
      }
    } catch {
      // ignore
    }
  };

  const toggleInCollection = async (collectionId: string) => {
    try {
      const inCol = membership[collectionId];
      const res = await fetch(`/api/collections/${collectionId}/recipes`, {
        method: inCol ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (res.ok) {
        setMembership((prev) => ({ ...prev, [collectionId]: !inCol }));
        router.refresh();
      }
    } catch {
      // ignore
    }
  };

  const createAndSaveToList = async () => {
    if (!newListName.trim() || isCreating) return;

    try {
      setIsCreating(true);
      // Create new collection
      const createRes = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newListName.trim(),
          description: "",
          isPublic: false,
        }),
      });

      if (createRes.ok) {
        const newCollection = await createRes.json();

        // Add recipe to the new collection
        await fetch(`/api/collections/${newCollection.id}/recipes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        });

        // Update local state
        setCollections((prev) => [...prev, newCollection]);
        setMembership((prev) => ({ ...prev, [newCollection.id]: true }));
        setNewListName("");
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setIsCreating(false);
    }
  };

  const heartClass = useMemo(
    () =>
      `h-5 w-5 ${
        isFavorited ? "text-red-600" : "text-gray-600"
      } transition-colors`,
    [isFavorited]
  );

  return (
    <>
      {/* Transparent backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          {/* Modal Dialog */}
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Save to favorite list
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {/* Favorites Option */}
              <button
                onClick={toggleFavorite}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 mb-3 transition-colors"
              >
                <span className="text-base font-medium text-gray-900 dark:text-white">
                  Favorites
                </span>
                <FiHeart
                  className={`h-5 w-5 ${
                    isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
              </button>

              {/* Collections List */}
              {loading ? (
                <div className="text-sm text-gray-400 py-4">Loading...</div>
              ) : (
                <div className="space-y-2">
                  {collections.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => toggleInCollection(c.id)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-base text-gray-900 dark:text-white">
                        {c.name}
                      </span>
                      {membership[c.id] && (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Create New List */}
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createAndSaveToList()}
                  placeholder="New list name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <button
                  onClick={createAndSaveToList}
                  disabled={!newListName.trim() || isCreating}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? "Creating..." : "Create & Save"}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/favLists");
                }}
                className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Manage Lists
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/favLists/new");
                }}
                className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                New List
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          aria-label="Save recipe"
        >
          <FiHeart className={heartClass} />
          <span className="text-sm">{isFavorited ? "Saved" : "Save"}</span>
        </button>
      </div>
    </>
  );
}
