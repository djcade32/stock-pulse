import { create } from "zustand";

export interface QuickChartState {
  quickChartList: string[];
  addToQuickChartList: (symbol: string) => void;
}

const useQuickChartStore = create<QuickChartState>((set, get) => ({
  quickChartList: [],

  addToQuickChartList: (symbol: string) => {
    const currentQuickChartList = get().quickChartList;
    if (!currentQuickChartList.includes(symbol)) {
      set({ quickChartList: [...currentQuickChartList, symbol] });
    }
  },
}));

export default useQuickChartStore;
