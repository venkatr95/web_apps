"use client";

import clsx from "clsx";
import { Loader2, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { searchPlaces } from "@/lib/geocode";
import { useStore } from "@/lib/store";
import type { PlaceSuggestion } from "@/lib/types";

export interface AddressAutocompleteProps {
  label: string;
  placeholder?: string;
  /** Display / typed value */
  value: string;
  onChangeValue: (text: string) => void;
  onSelectPlace: (place: PlaceSuggestion) => void;
  /** Bias results near this point (e.g. other endpoint or city center). */
  proximity?: { lat: number; lon: number };
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  inputClassName?: string;
}

/**
 * Google Maps–style address autofill.
 *
 * UX rules:
 * - Do NOT open on mount or when a committed address is only focused.
 * - Open only after intentional user input (typing / clear / empty focus).
 * - Parent value syncs (map pick, GPS) never pop the list open.
 */
export function AddressAutocomplete({
  label,
  placeholder = "Enter address",
  value,
  onChangeValue,
  onSelectPlace,
  proximity,
  icon,
  active,
  disabled,
  inputClassName,
}: AddressAutocompleteProps) {
  const light = useStore((s) => s.uiTheme === "light");
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PlaceSuggestion[]>([]);
  const [highlight, setHighlight] = useState(0);
  /** Dropdown opens upward when there is more room above the field. */
  const [openUp, setOpenUp] = useState(false);
  /** User is actively querying — only then may the menu open. */
  const queryingRef = useRef(false);
  /** Skip search after programmatic select / external value sync. */
  const skipSearchRef = useRef(false);
  const lastExternalValue = useRef(value);

  const placeMenu = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    // Prefer down when there is room; otherwise flip up (common in bottom sheets)
    setOpenUp(spaceBelow < 220 && spaceAbove > spaceBelow);
  }, []);

  const runSearch = useCallback(
    async (q: string, { openMenu }: { openMenu: boolean }) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      try {
        const results = await searchPlaces(q, {
          proximity,
          limit: 6,
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        setItems(results);
        setHighlight(0);
        if (openMenu && queryingRef.current) {
          placeMenu();
          // Open for hits, or for "no results" after a real query (≥2 chars)
          setOpen(results.length > 0 || q.trim().length >= 2);
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    },
    [proximity, placeMenu]
  );

  // External value changes (map pick, GPS, presets, parent sync) must not open the menu
  useEffect(() => {
    if (value === lastExternalValue.current) return;
    lastExternalValue.current = value;
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    // Committed from outside while not querying → close + clear suggestions
    if (!queryingRef.current) {
      setOpen(false);
      setItems([]);
      setLoading(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    }
  }, [value]);

  // Debounced search only while the user is actively querying
  useEffect(() => {
    if (!queryingRef.current || disabled) return;
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!queryingRef.current) return;
      void runSearch(value, { openMenu: true });
    }, 280);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, runSearch, disabled]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Keep direction correct if the sheet scrolls while open
  useEffect(() => {
    if (!open) return;
    placeMenu();
    const onScroll = () => placeMenu();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, placeMenu]);

  function closeMenu() {
    queryingRef.current = false;
    setOpen(false);
    setLoading(false);
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }

  function beginQuery(nextText?: string) {
    queryingRef.current = true;
    placeMenu();
    const q = nextText !== undefined ? nextText : value;
    // Immediate feedback for empty (presets) or clear; debounce longer typing via effect
    if (q.trim().length < 2) {
      void runSearch(q, { openMenu: true });
    }
  }

  function pick(item: PlaceSuggestion) {
    skipSearchRef.current = true;
    queryingRef.current = false;
    lastExternalValue.current = item.full;
    onChangeValue(item.full);
    onSelectPlace(item);
    setOpen(false);
    setItems([]);
    setLoading(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      return;
    }

    // Explicit open with keyboard even if closed
    if (!open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        beginQuery();
        void runSearch(value, { openMenu: true });
      }
      return;
    }

    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[highlight];
      if (item) pick(item);
    }
  }

  const showList = open && items.length > 0;
  const showEmpty = open && !loading && value.trim().length >= 2 && items.length === 0;

  const menuPosition = openUp
    ? "bottom-[calc(100%+6px)] top-auto"
    : "top-[calc(100%+6px)] bottom-auto";

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="relative mt-0.5 flex items-center gap-1.5">
        {icon}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && items[highlight] ? `${listId}-${highlight}` : undefined
          }
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            const text = e.target.value;
            lastExternalValue.current = text;
            queryingRef.current = true;
            onChangeValue(text);
            // Open after first keystroke only (effect will fill results)
            if (text.trim().length === 0) {
              // Empty → show presets right away
              void runSearch("", { openMenu: true });
            } else {
              // Keep closed until results land; avoid flash of empty shell
              setOpen(false);
            }
          }}
          onFocus={() => {
            // Committed address in the field: stay closed until the user edits.
            // Empty field: open presets so they can pick quickly.
            if (!value.trim()) {
              beginQuery("");
            }
          }}
          onBlur={() => {
            // Delay so mousedown on an option can fire first
            window.setTimeout(() => {
              if (!rootRef.current?.contains(document.activeElement)) {
                closeMenu();
              }
            }, 120);
          }}
          onKeyDown={onKeyDown}
          className={clsx(
            "w-full min-w-0 bg-transparent text-sm outline-none",
            light
              ? "text-zinc-900 placeholder:text-zinc-400"
              : "text-zinc-100 placeholder:text-zinc-600",
            inputClassName
          )}
        />
        {loading && queryingRef.current && (
          <Loader2 size={14} className="shrink-0 animate-spin text-zinc-500" />
        )}
        {!!value && !(loading && queryingRef.current) && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => {
              // Keep focus on input; don't let blur close before clear
              e.preventDefault();
            }}
            onClick={() => {
              lastExternalValue.current = "";
              onChangeValue("");
              setItems([]);
              beginQuery("");
              inputRef.current?.focus();
            }}
            className={clsx(
              "shrink-0 rounded p-0.5",
              light ? "text-zinc-400 hover:text-zinc-700" : "text-zinc-500 hover:text-zinc-300"
            )}
            aria-label="Clear address"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showList && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className={clsx(
            "absolute left-0 right-0 z-50 max-h-[min(40vh,16rem)] overflow-auto rounded-xl border py-1 shadow-xl backdrop-blur-md",
            menuPosition,
            light
              ? "border-zinc-200 bg-white text-zinc-900 shadow-zinc-300/40"
              : "border-white/10 bg-zinc-900/98 text-zinc-100 shadow-black/40",
            active && "ring-1 ring-emerald-400/20"
          )}
        >
          {items.map((item, i) => (
            <li key={item.id} role="presentation">
              <button
                type="button"
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(item);
                }}
                className={clsx(
                  "flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors",
                  i === highlight
                    ? light
                      ? "bg-emerald-50"
                      : "bg-emerald-500/15"
                    : light
                      ? "hover:bg-zinc-50"
                      : "hover:bg-white/[0.04]"
                )}
              >
                <MapPin
                  size={15}
                  className={clsx(
                    "mt-0.5 shrink-0",
                    item.source === "preset" ? "text-sky-500" : "text-emerald-500"
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={clsx(
                      "block truncate text-sm font-medium",
                      light ? "text-zinc-900" : "text-zinc-100"
                    )}
                  >
                    {item.primary}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
                    {item.secondary}
                  </span>
                </span>
              </button>
            </li>
          ))}
          <li
            className={clsx(
              "border-t px-3 py-1.5 text-[10px] text-zinc-500",
              light ? "border-zinc-100" : "border-white/5"
            )}
          >
            Type to search · presets when empty
          </li>
        </ul>
      )}

      {showEmpty && (
        <div
          className={clsx(
            "absolute left-0 right-0 z-50 rounded-xl border px-3 py-3 text-xs shadow-xl",
            menuPosition,
            light
              ? "border-zinc-200 bg-white text-zinc-500"
              : "border-white/10 bg-zinc-900/98 text-zinc-500"
          )}
        >
          No places found. Try another address or pick on the map.
        </div>
      )}
    </div>
  );
}
