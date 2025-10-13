import Button from "@/components/general/Button";
import LoaderComponent from "@/components/general/LoaderComponent";
import { useBatchQuotes } from "@/lib/client/hooks/useBatchQuotes";
import { useCompanyLogo } from "@/lib/client/hooks/useCompanyLogo";
import React from "react";
import { FaPlus } from "react-icons/fa6";
import { ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFetchStockProfile } from "@/lib/client/hooks/useFetchStockProfile";
import useWatchlistStore from "@/stores/watchlist-store";
import { useAddToWatchlistAndAnalyze } from "@/lib/client/mutations/useAddToWatchlistAndAnalyze";
import { toast } from "sonner";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useUid } from "@/hooks/useUid";
import { useQuery } from "@tanstack/react-query";
import { WatchlistStock } from "@/types";

interface StockProfileHeaderProps {
  symbol: string;
}

const StockProfileHeader = ({ symbol }: StockProfileHeaderProps) => {
  const { uid, loading } = useUid();
  const { data, isLoading } = useFetchStockProfile(symbol);
  const { addToWatchlist, existInWatchlist, removeFromWatchlist, watchlist, setWatchlist } =
    useWatchlistStore();
  const addMany = useAddToWatchlistAndAnalyze();
  const { isPending } = useQuery({
    queryKey: ["watchlist", uid], // include uid in key so it refetches per user
    queryFn: async () => {
      const watchlisttDoc = doc(db, `watchlists/${uid}`);
      const fetchedDoc = await getDoc(watchlisttDoc);
      // Sort alphabetically by symbol
      if (fetchedDoc.exists() && fetchedDoc.data().stocks) {
        const stocks = fetchedDoc.data().stocks;
        stocks.sort((a: { symbol: string }, b: { symbol: string }) =>
          a.symbol.localeCompare(b.symbol)
        );
        // Get latestEarningsDate from companies collection
        const stocksWithEarnings = await Promise.all(
          stocks.map(async (stock: WatchlistStock) => {
            const companyDoc = doc(db, `companies/${stock.symbol}`);
            const companySnap = await getDoc(companyDoc);
            if (companySnap.exists()) {
              const companyData = companySnap.data();
              return {
                ...stock,
                latestEarningsDate: companyData.latestEarningsDate || null,
              };
            }
            return { ...stock, latestEarningsDate: null };
          })
        );
        setWatchlist(stocksWithEarnings);
      } else {
        setWatchlist([]);
      }
      return true;
    },
    enabled: !!uid && !loading, // prevent running before uid is ready
  });

  const { quotesBySymbol, isLoading: isLoadingQuotes } = useBatchQuotes([symbol], {
    enabled: true,
    marketRefetchMs: 30_000,
  });

  const { url: logoUrl } = useCompanyLogo(symbol);

  const quote = quotesBySymbol[symbol];
  const dollarChange = quote ? quote.c - quote.pc : null;
  const percentChange = quote ? (dollarChange! / quote.pc) * 100 : null;
  const isPositive = percentChange ? percentChange > 0 : null;

  const handleAddToWatchlist = async () => {
    if (!existInWatchlist(symbol) && data) {
      const stock = { symbol, description: data.name as string };
      addToWatchlist({ symbol: stock.symbol, description: stock.description as string });
      await addMany.mutateAsync([stock]).then(() => {
        toast.success(`${symbol} added to your watchlist!`);
      });
    }
  };

  const handleRemoveFromWatchlist = async () => {
    removeFromWatchlist(symbol);
    const ref = doc(db, "watchlists", uid!);
    await setDoc(
      ref,
      {
        uid,
        stocks: watchlist.filter((s) => s.symbol !== symbol),
      },
      { merge: true }
    ).then(() => {
      toast.success(`${symbol} removed from your watchlist.`);
    });
  };

  return (
    <div className="flex justify-between">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {logoUrl.data ? (
            <img
              src={logoUrl.data}
              alt={`${symbol} logo`}
              className="!w-15 h-15 rounded-lg bg-white bg-cover"
            />
          ) : (
            <div className="w-15 h-15 rounded-lg bg-(--secondary-text-color) text-foreground font-bold flex items-center justify-center">
              <p className="text-2xl">{symbol[0]}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{symbol}</h1>
            {percentChange && (
              <div
                className={cn(
                  "flex gap-1 items-center text-xs px-2 py-1 rounded-full font-bold tracking-tight overflow-hidden whitespace-nowrap text-ellipsis",
                  isPositive && "bg-(--success-color)/30 text-(--success-color)",
                  !isPositive && "bg-(--danger-color)/30 text-(--danger-color)"
                )}
              >
                <ArrowUp size={15} />
                <p>
                  {isPositive && "+"}
                  {percentChange?.toFixed(2)}%
                </p>
              </div>
            )}
          </div>

          <LoaderComponent height="1rem" width="10rem" loading={isLoading} rounded="sm">
            <p className="text-(--secondary-text-color)">
              {data?.name || "N/A"} • {data?.exchange || "N/A"}
            </p>
          </LoaderComponent>

          <LoaderComponent height="2rem" width="8rem" loading={isLoadingQuotes} rounded="sm">
            <div className="flex items-end gap-2">
              <h1 className="text-3xl font-bold">${Number(quote?.c.toFixed(2))}</h1>
              <p
                className={`${
                  dollarChange
                    ? dollarChange > 0
                      ? "text-(--success-color)"
                      : "text-(--danger-color)"
                    : "text-(--secondary-text-color)"
                }`}
              >
                {dollarChange &&
                  (dollarChange > 0
                    ? `+$${dollarChange.toFixed(2)}`
                    : `-$${dollarChange.toFixed(2).replace("-", "")}`)}
              </p>
            </div>
          </LoaderComponent>
        </div>
      </div>
      {!isPending && (
        <div>
          {existInWatchlist(symbol) ? (
            <Button
              className="flex-1/2 font-bold"
              variant="danger"
              onClick={handleRemoveFromWatchlist}
            >
              <Minus />
              Remove from Watchlist
            </Button>
          ) : (
            <Button className="flex-1/2 font-bold" onClick={handleAddToWatchlist}>
              <FaPlus />
              Add to Watchlist
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StockProfileHeader;
