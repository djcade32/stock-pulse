import { track } from "@/lib/analytics";
import { WatchlistStock } from "@/types";
import { create } from "zustand";

export interface WatchlistState {
  watchlist: WatchlistStock[];
  setWatchlist: (list: WatchlistStock[]) => void;
  addToWatchlist: (stock: WatchlistStock) => void;
  removeFromWatchlist: (symbol: string) => void;
  existInWatchlist: (symbol: string) => boolean;
  clearWatchlist: () => void;
}

const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlist: [],

  setWatchlist: (list) => set({ watchlist: list }),

  addToWatchlist: (stock: WatchlistStock) => {
    const currentWatchlist = get().watchlist;
    if (!currentWatchlist.find((s) => s.symbol === stock.symbol)) {
      track("added_to_watchlist", { ticker: stock.symbol });
      set({ watchlist: [...currentWatchlist, stock] });
    }
  },

  removeFromWatchlist: (symbol: string) => {
    const currentWatchlist = get().watchlist;
    track("removed_from_watchlist", { ticker: symbol });
    set({ watchlist: currentWatchlist.filter((s) => s.symbol !== symbol) });
  },

  existInWatchlist: (symbol: string) => {
    return get().watchlist.some((s) => s.symbol === symbol);
  },

  clearWatchlist: () => set({ watchlist: [] }),
}));

export default useWatchlistStore;
