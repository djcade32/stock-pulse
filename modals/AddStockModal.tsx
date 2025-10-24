"use client";

import Input from "@/components/general/Input";
import Modal from "@/components/general/Modal";
import SearchStockRow from "@/components/SearchStockRow";
import { Switch } from "@/components/ui/switch";
import { auth, db } from "@/firebase/client";
import { useStockSymbols } from "@/lib/client/hooks/useStockSymbols";
import { useAddToWatchlistAndAnalyze } from "@/lib/client/mutations/useAddToWatchlistAndAnalyze";
import useQuickChartStore from "@/stores/quick-chart-store";
import useWatchlistStore from "@/stores/watchlist-store";
import { ModalActionButtons, Stock, WatchlistStock } from "@/types";
import { doc, setDoc } from "firebase/firestore";
import { Search, ChartLine } from "lucide-react";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { FaBookmark } from "react-icons/fa6";
import { toast } from "sonner";

interface AddStockModalProps {
  open: boolean;
  setOpen: (open: boolean) => void; // Uncomment if you want to control the modal from parent
  watchlistOnly?: boolean; // If true, only allow adding to watchlist
  onSubmit?: () => void; // Optional: callback after successful submission
}

const AddStockModal = ({ open, setOpen, watchlistOnly, onSubmit }: AddStockModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<WatchlistStock[]>([]);
  const [addWatchlist, setAddWatchlist] = useState(true);
  const [addQuickChart, setAddQuickChart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceSearchTerm, setDebounceSearchTerm] = useState(searchTerm);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const { stocks, isLoading, isFetching } = useStockSymbols(debounceSearchTerm);
  const { addToWatchlist, existInWatchlist } = useWatchlistStore();
  const { addToQuickChartList, quickChartList, existInQuickChartList } = useQuickChartStore();
  const addMany = useAddToWatchlistAndAnalyze();

  useMemo(() => {
    setFilteredStocks(stocks.data);
  }, [isLoading, isFetching]);

  // Debounce search term input to avoid excessive filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearchTerm(searchTerm);
    }, 1000); // Adjust the delay as needed

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    open && inputRef.current?.focus();
    setSelected([]);
    setAddWatchlist(true);
    setAddQuickChart(false);
    setSearchTerm("");
    setDebounceSearchTerm("");
  }, [open]);

  const toggleWatchlist = () => setAddWatchlist(!addWatchlist);
  const toggleQuickChart = () => setAddQuickChart(!addQuickChart);
  const isSelected = (symbol: string) => selected.find((s) => s.symbol === symbol) !== undefined;

  const onSelect = (stock: WatchlistStock) => {
    if (existInWatchlist(stock.symbol) && existInQuickChartList(stock.symbol)) return;
    const exists = selected.find((s) => s.symbol === stock.symbol);
    if (exists) {
      setSelected(selected.filter((s) => s.symbol !== stock.symbol));
    } else {
      setSelected([...selected, stock]);
    }
  };

  const getToastMessage = () => {
    if (addQuickChart && addWatchlist) {
      if (selected.length === 1) return `Added ${selected[0].symbol} to Watchlist and QuickChart.`;
      return `Added ${selected.length} stocks to Watchlist and QuickChart.`;
    }
    if (addWatchlist) {
      if (selected.length === 1) return `Added ${selected[0].symbol} to Watchlist.`;
      return `Added ${selected.length} stocks to Watchlist.`;
    }
    if (addQuickChart) {
      if (selected.length === 1) return `Added ${selected[0].symbol} to QuickChart.`;
      return `Added ${selected.length} stocks to QuickChart.`;
    }
    return "";
  };

  const handleSubmit = async () => {
    try {
      onSubmit?.();
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.error("User not authenticated");
        return;
      }
      let addedToWatchlist = 0;
      let addedToQuickChart = 0;
      if (addWatchlist && selected.length) {
        selected.forEach((stock) => {
          if (existInWatchlist(stock.symbol)) {
            return toast.warning(`${stock.symbol} is already in your watchlist`);
          }
          addToWatchlist({ ...stock, createdAt: new Date().toISOString() });
          addedToWatchlist += 1;
        });

        await addMany.mutateAsync(selected).finally(() => onSubmit?.());
      }
      if (addQuickChart) {
        selected.forEach(({ symbol }) => {
          if (existInQuickChartList(symbol)) return;
          addToQuickChartList(symbol);
        });
        addedToQuickChart += 1;
        const quickChartDocRef = doc(db, "quickCharts", uid);
        await setDoc(
          quickChartDocRef,
          {
            uid,
            symbols: [...selected.map(({ symbol }) => symbol), ...quickChartList],
          },
          { merge: true }
        );
      }
      setOpen(false);
      toast.success(getToastMessage());
    } catch (error) {
      console.error("Error adding stocks:", error);
    }
  };

  const modalActionButtons: ModalActionButtons = {
    confirm: {
      label: "Add Stock(s)",
      onClick: handleSubmit,
      disabled: selected.length === 0,
    },
    cancel: { label: "Cancel" },
  };

  return (
    <Modal header="Add Stock" actionButtons={modalActionButtons} open={open} setOpen={setOpen}>
      <div>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for stocks (e.g. AAPL, Apple Inc.)"
          preIcon={<Search color="var(--secondary-text-color)" size={20} />}
          className="bg-(--secondary-color) max-w-full border-(--gray-accent-color) py-2 "
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="mt-4 flex flex-col gap-2 overflow-y-auto h-[200px]">
          {filteredStocks?.map(({ symbol, description, type }) => (
            <SearchStockRow
              key={symbol}
              stock={{
                symbol,
                name: description,
                type: type || "N/A",
              }}
              onSelect={onSelect}
              isSelected={isSelected(symbol)}
            />
          ))}
        </div>
        {/* <div className="mt-6 border-t-2 border-(--secondary-color) pt-4 flex flex-col gap-4">
          <p>Add {!!selected.length && selected.length} stock(s) to:</p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaBookmark size={18} color="var(--accent-color)" />
                <p>Watchlist</p>
              </div>
              <Switch checked={addWatchlist} onCheckedChange={toggleWatchlist} />
            </div>
            {!watchlistOnly && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChartLine size={18} color="var(--success-color)" />
                  <p>QuickChart</p>
                </div>
                <Switch checked={addQuickChart} onCheckedChange={toggleQuickChart} />
              </div>
            )}
          </div>
        </div> */}
      </div>
    </Modal>
  );
};

export default AddStockModal;
