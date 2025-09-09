"use client";

import Input from "@/components/general/Input";
import Modal from "@/components/general/Modal";
import SearchStockRow from "@/components/SearchStockRow";
import { Switch } from "@/components/ui/switch";
import { auth, db } from "@/firebase/client";
import { useStockSymbols } from "@/lib/client/hooks/useStockSymbols";
import useQuickChartStore from "@/stores/quick-chart-store";
import useWatchlistStore from "@/stores/watchlist-store";
import { ModalActionButtons, Stock } from "@/types";
import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { Search, ChartLine } from "lucide-react";
import React, { useState, useEffect, useMemo, use } from "react";
import { FaBookmark } from "react-icons/fa6";

interface AddStockModalProps {
  open: boolean;
  setOpen: (open: boolean) => void; // Uncomment if you want to control the modal from parent
}

const AddStockModal = ({ open, setOpen }: AddStockModalProps) => {
  const [selected, setSelected] = useState<
    {
      symbol: string;
      description: string;
    }[]
  >([]);
  const [addWatchlist, setAddWatchlist] = useState(true);
  const [addQuickChart, setAddQuickChart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceSearchTerm, setDebounceSearchTerm] = useState(searchTerm);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const { stocks, isLoading, isFetching } = useStockSymbols(debounceSearchTerm);
  const { addToWatchlist, watchlist } = useWatchlistStore();
  const { addToQuickChartList, quickChartList } = useQuickChartStore();

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
    setSelected([]);
    setAddWatchlist(true);
    setAddQuickChart(false);
    setSearchTerm("");
    setDebounceSearchTerm("");
  }, [open]);

  const toggleWatchlist = () => setAddWatchlist(!addWatchlist);
  const toggleQuickChart = () => setAddQuickChart(!addQuickChart);
  const isSelected = (symbol: string) => selected.find((s) => s.symbol === symbol) !== undefined;

  const onSelect = (stock: { symbol: string; description: string }) => {
    const exists = selected.find((s) => s.symbol === stock.symbol);
    if (exists) {
      setSelected(selected.filter((s) => s.symbol !== stock.symbol));
    } else {
      setSelected([...selected, stock]);
    }
  };

  const handleSubmit = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.error("User not authenticated");
        return;
      }
      if (addWatchlist) {
        selected.forEach((stock) => addToWatchlist(stock));
        const watchlistDocRef = doc(db, "watchlists", uid);
        await setDoc(
          watchlistDocRef,
          {
            uid,
            stocks: [...selected, ...watchlist],
          },
          { merge: true }
        );
      }
      if (addQuickChart) {
        selected.forEach(({ symbol }) => addToQuickChartList(symbol));
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
    } catch (error) {}
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
          type="text"
          placeholder="Search for stocks (e.g. AAPL, Apple Inc.)"
          preIcon={<Search color="var(--secondary-text-color)" size={20} />}
          className="bg-(--secondary-color) max-w-full border-(--gray-accent-color) py-2 "
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="mt-4 flex flex-col gap-2 overflow-y-auto h-[200px]">
          {!searchTerm &&
            selected?.map(({ symbol, description }) => (
              <SearchStockRow
                key={symbol}
                stock={{
                  symbol,
                  name: description,
                }}
                onSelect={onSelect}
                isSelected={isSelected(symbol)}
              />
            ))}
          {filteredStocks?.map(
            ({ symbol, description }) =>
              !isSelected(symbol) && (
                <SearchStockRow
                  key={symbol}
                  stock={{
                    symbol,
                    name: description,
                  }}
                  onSelect={onSelect}
                  isSelected={isSelected(symbol)}
                />
              )
          )}
        </div>
        <div className="mt-6 border-t-2 border-(--secondary-color) pt-4 flex flex-col gap-4">
          <p>Add {!!selected.length && selected.length} stock(s) to:</p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaBookmark size={18} color="var(--accent-color)" />
                <p>Watchlist</p>
              </div>
              <Switch checked={addWatchlist} onCheckedChange={toggleWatchlist} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChartLine size={18} color="var(--success-color)" />
                <p>QuickChart</p>
              </div>
              <Switch checked={addQuickChart} onCheckedChange={toggleQuickChart} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddStockModal;
