import { create } from "zustand";

export interface WatchlistState {
  watchlist: {
    symbol: string;
    description: string;
  }[];
  setWatchlist: (list: { symbol: string; description: string }[]) => void;
  addToWatchlist: (stock: { symbol: string; description: string }) => void;
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

  existInWatchlist: (symbol: string) => {
    return get().watchlist.some((s) => s.symbol === symbol);
  },
}));

export default useWatchlistStore;
