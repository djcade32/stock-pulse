// lib/client/hooks/useQuoteStreamPatcher.ts
import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

type FanoutTick = {
  s: string; // symbol, e.g. "AAPL"
  p: number; // last price
  t: number; // epoch milliseconds
  v?: number; // trade volume (optional)
};

type FanoutMessage =
  | { type: "ticks"; data: FanoutTick[] }
  | { type: "info"; message: string }
  | { type: string; [key: string]: unknown };

type QuoteCacheShape = {
  c: number; // current price
  t: number; // epoch seconds
  // other fields from your REST snapshot may exist; we leave them intact
};

function normalizeSymbols(input: string[]): string[] {
  const unique = Array.from(
    new Set((input || []).map((s) => (s || "").trim().toUpperCase()).filter(Boolean))
  );
  unique.sort();
  return unique;
}

function resolveWebSocketUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (envUrl) return envUrl; // e.g. wss://your-fanout.example.com

  // Dev fallback assumes fanout on localhost:8081
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const port = 8081;
  return `${isHttps ? "wss" : "ws"}://${host}:${port}`;
}

/**
 * useQuoteStreamPatcher
 * - Connects to your fanout WebSocket
 * - Subscribes to the given symbols
 * - On each tick, updates React Query caches so UI shows live prices
 *
 * Works great alongside your existing batch REST hook.
 */
export function useQuoteStreamPatcher(
  inputSymbols: string[],
  options?: {
    enabled?: boolean;
    patchDebounceMs?: number; // reduce re-renders during heavy tick bursts
  }
) {
  const isEnabled = options?.enabled ?? true;
  const patchDebounceMs = options?.patchDebounceMs ?? 100;

  const queryClient = useQueryClient();
  const symbols = useMemo(() => normalizeSymbols(inputSymbols), [inputSymbols]);

  // Buffer the very latest tick per symbol and apply periodically.
  const latestBySymbolRef = useRef<Record<string, { price: number; tsMs: number }>>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);

  function applyBufferedPatches(): void {
    const buffered = latestBySymbolRef.current;
    latestBySymbolRef.current = {};

    const updatedSymbols = Object.keys(buffered);
    if (updatedSymbols.length === 0) return;

    // 1) Patch any batch cache that includes these symbols: ["batchQuotes", <string[]>]
    const batchEntries = queryClient.getQueriesData<any>({ queryKey: ["batchQuotes"] });
    for (const [queryKey, cachedValue] of batchEntries) {
      if (!cachedValue?.symbols?.length) continue;

      const relevant = updatedSymbols.filter((sym) => cachedValue.symbols.includes(sym));
      if (relevant.length === 0) continue;

      queryClient.setQueryData(queryKey, (previous: any) => {
        const base = previous ?? cachedValue;
        if (!base?.quotes) return base;

        const next = {
          ...base,
          quotes: { ...base.quotes },
        };

        for (const sym of relevant) {
          const live = buffered[sym];
          const existing = next.quotes[sym] ?? { data: null, cached: false, error: null };
          const previousData: QuoteCacheShape = existing.data ?? {
            c: live.price,
            t: Math.floor(live.tsMs / 1000),
          };

          next.quotes[sym] = {
            ...existing,
            data: {
              ...previousData,
              c: live.price,
              t: Math.floor(live.tsMs / 1000), // keep in seconds for consistency
            },
            cached: true,
            error: null,
          };
        }
        return next;
      });
    }

    // 2) Also patch any single-quote cache: ["quote", SYMBOL]
    for (const sym of updatedSymbols) {
      const live = buffered[sym];
      queryClient.setQueryData<QuoteCacheShape>(["quote", sym], (previous) => {
        const base =
          previous ?? ({ c: live.price, t: Math.floor(live.tsMs / 1000) } as QuoteCacheShape);
        return { ...base, c: live.price, t: Math.floor(live.tsMs / 1000) };
      });
    }
  }

  function schedulePatch(): void {
    if (debounceTimerRef.current) return;
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      applyBufferedPatches();
    }, patchDebounceMs);
  }

  useEffect(() => {
    if (!isEnabled || symbols.length === 0) return;

    const socketUrl = resolveWebSocketUrl();
    const socket = new WebSocket(socketUrl);
    webSocketRef.current = socket;

    socket.onopen = () => {
      try {
        socket.send(JSON.stringify({ type: "subscribe", symbols }));
      } catch {
        // ignore
      }
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const message: FanoutMessage = JSON.parse(event.data);
        if (message.type === "ticks" && Array.isArray(message.data)) {
          for (const tick of message.data as FanoutTick[]) {
            const symbol = (tick.s || "").toUpperCase();
            if (!symbol) continue;
            latestBySymbolRef.current[symbol] = { price: tick.p, tsMs: tick.t };
          }
          schedulePatch();
        }
      } catch {
        // ignore malformed messages
      }
    };

    // Optional: log or handle errors/close
    socket.onerror = () => {
      /* no-op */
    };
    socket.onclose = () => {
      /* could add retry/backoff here if desired */
    };

    return () => {
      try {
        socket.send(JSON.stringify({ type: "unsubscribe", symbols }));
      } catch {
        // ignore
      }
      socket.close();
      webSocketRef.current = null;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      latestBySymbolRef.current = {};
    };
  }, [isEnabled, JSON.stringify(symbols)]);

  // No return; this hook just patches caches behind the scenes.
  return null;
}
