import { create } from "zustand";

export interface WatchlistState {
  watchlist: {
    symbol: string;
    description: string;
  }[];
  setWatchlist: (list: { symbol: string; description: string }[]) => void;
  addToWatchlist: (stock: { symbol: string; description: string }) => void;
  removeFromWatchlist: (symbol: string) => void;
  existInWatchlist: (symbol: string) => boolean;
}

const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlist: [],

  setWatchlist: (list) => set({ watchlist: list }),

  addToWatchlist: (stock: { symbol: string; description: string }) => {
    const currentWatchlist = get().watchlist;
    if (!currentWatchlist.find((s) => s.symbol === stock.symbol)) {
      set({ watchlist: [...currentWatchlist, stock] });
    }
  },

  removeFromWatchlist: (symbol: string) => {
    const currentWatchlist = get().watchlist;
    set({ watchlist: currentWatchlist.filter((s) => s.symbol !== symbol) });
  },

  existInWatchlist: (symbol: string) => {
    return get().watchlist.some((s) => s.symbol === symbol);
  },
}));

export default useWatchlistStore;
