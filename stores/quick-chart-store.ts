import { create } from "zustand";

export interface QuickChartState {
  quickChartList: string[];
  setQuickChartList: (list: string[]) => void;
  addToQuickChartList: (symbol: string) => void;
  existInQuickChartList: (symbol: string) => boolean;
}

const useQuickChartStore = create<QuickChartState>((set, get) => ({
  quickChartList: [],

  setQuickChartList: (list: string[]) => set({ quickChartList: list }),

  addToQuickChartList: (symbol: string) => {
    const currentQuickChartList = get().quickChartList;
    console.log("Current Quick Chart List:", currentQuickChartList);
    if (!currentQuickChartList.includes(symbol)) {
      set({ quickChartList: [...currentQuickChartList, symbol] });
    }
    console.log("Updated Quick Chart List:", get().quickChartList);
  },

  existInQuickChartList: (symbol: string) => {
    return get().quickChartList.includes(symbol);
  },
}));

export default useQuickChartStore;
