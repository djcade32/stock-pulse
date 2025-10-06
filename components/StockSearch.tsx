"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import Input from "./general/Input";
import { StockHit } from "@/types";
import { useStockSymbols } from "@/lib/client/hooks/useStockSymbols";

type StockSearchProps = {
  className?: string;
  placeholder?: string;
  maxResults?: number;
  /** Optional: callback when a user selects a result */
  onSelect?: (hit: StockHit) => void;
  /** Optional: override how we fetch search results */
  fetcher?: (q: string, signal: AbortSignal) => Promise<StockHit[]>;
  onChange?: (q?: string) => void;
  clear?: boolean; // when true, clears the input field
  value?: string; // controlled input value
};

const defaultFetcher = async (q: string, signal: AbortSignal): Promise<StockHit[]> => {
  if (!q.trim()) return [];
  const params = new URLSearchParams({ q });
  const res = await fetch(`/api/search?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  // Normalize shape if needed
  return (data?.results ?? data ?? []) as StockHit[];
};

export default function StockSearch({
  className,
  placeholder = "Search ticker or company...",
  maxResults = 8,
  onSelect,
  fetcher = defaultFetcher,
  onChange,
  clear,
  value,
}: StockSearchProps) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<StockHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const { stocks, isLoading, isFetching } = useStockSymbols("");

  const rootRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useMemo(
    () => `stock-search-listbox-${Math.random().toString(36).slice(2)}`,
    []
  );

  useEffect(() => {
    setHits(stocks.data);
  }, [isLoading, isFetching]);

  // Close on outside click
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  // Debounced search with AbortController
  useEffect(() => {
    const controller = new AbortController();
    const debounce = setTimeout(async () => {
      if (!query.trim()) {
        setHits(stocks.data);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const results = await fetcher(query.trim(), controller.signal);
        setHits(results.slice(0, maxResults));
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError(err?.message ?? "Search error");
        }
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => {
      controller.abort();
      clearTimeout(debounce);
    };
  }, [query, maxResults, fetcher]);

  // Clear input if `clear` prop is true
  useEffect(() => {
    if (clear) {
      setQuery("");
      setHits([]);
      setError(null);
      setLoading(false);
      setActiveIndex(-1);
    }
  }, [clear]);

  // Open panel when focusing/typing
  const handleFocus = () => setOpen(true);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && (e.key.length === 1 || e.key === "ArrowDown")) setOpen(true);

    if (!hits.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? hits.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < hits.length) {
        e.preventDefault();
        select(hits[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const select = (hit: StockHit) => {
    onSelect?.(hit);
    setQuery(hit.symbol);
    setHits([]);
    setActiveIndex(-1);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className || ""}`}>
      <div
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className="w-full"
      >
        <Input
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e.target.value);
            setQuery(e.target.value);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          preIcon={<Search color="var(--secondary-text-color)" size={18} />}
          className="bg-(--secondary-color) w-full border-(--gray-accent-color) py-2"
        />
      </div>

      {/* Results panel */}
      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute mt-2 w-[min(520px,90vw)] max-h-72 overflow-auto rounded-lg border border-(--gray-accent-color) bg-(--background) shadow-xl z-50"
        >
          {loading && (
            <div className="px-3 py-2 text-sm text-(--secondary-text-color)">Searching…</div>
          )}
          {!loading && error && (
            <div className="px-3 py-2 text-sm text-red-400">Error: {error}</div>
          )}
          {!loading && !error && hits.length === 0 && query.trim() && (
            <div className="px-3 py-2 text-sm text-(--secondary-text-color)">No matches</div>
          )}
          {!loading &&
            !error &&
            hits.map((h, i) => {
              console.log("hit: ", h); // For debugging
              if (h.type === "Indice" && hits.length > 1) return null;
              if (h.type === "Indice")
                return (
                  <div
                    key={`${h.symbol}-${i}`}
                    className="px-3 py-2 text-sm text-(--secondary-text-color)"
                  >
                    No matches
                  </div>
                );
              const active = i === activeIndex;
              return (
                <div
                  key={`${h.symbol}-${i}`}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => e.preventDefault()} // avoid blurring input before click
                  onClick={() => select(h)}
                  className={[
                    "px-3 py-2 cursor-pointer transition-colors",
                    active
                      ? "bg-(--color-sidebar-accent) text-foreground"
                      : "hover:bg-(--color-sidebar-accent)",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tracking-tight">{h.symbol}</span>
                      <span className="text-(--secondary-text-color) text-sm">{h.description}</span>
                    </div>
                    {h.type && (
                      <span className="text-xs text-(--secondary-text-color)">{h.type}</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
