import { create } from "zustand";

export interface WatchlistState {
  watchlist: {
    symbol: string;
    description: string;
  }[];
  addToWatchlist: (stock: { symbol: string; description: string }) => void;
}

const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlist: [],

  addToWatchlist: (stock: { symbol: string; description: string }) => {
    const currentWatchlist = get().watchlist;
    if (!currentWatchlist.find((s) => s.symbol === stock.symbol)) {
      set({ watchlist: [...currentWatchlist, stock] });
    }
  },
}));

export default useWatchlistStore;
