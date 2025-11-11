import AiTag from "@/components/AiTag";
import LoaderComponent from "@/components/general/LoaderComponent";
import { useFetchStockProfile } from "@/lib/client/hooks/useFetchStockProfile";
import { cn } from "@/lib/utils";
import React from "react";
import { MdGroups } from "react-icons/md";

interface StockAnalystRatingsSectionProps {
  symbol: string;
}

const StockAnalystRatingsSection = ({ symbol }: StockAnalystRatingsSectionProps) => {
  const { data, isLoading } = useFetchStockProfile(symbol);

  const analystRecommendations = data?.analyst_recommendations || null;
  const totalRecommendations =
    analystRecommendations &&
    ["buy", "hold", "sell", "strongBuy", "strongSell"].reduce(
      (sum, key) => sum + (analystRecommendations[0]?.[key] || 0),
      0
    );
  const analystBuyPercentage =
    analystRecommendations && totalRecommendations
      ? ((analystRecommendations[0].buy + analystRecommendations[0].strongBuy) /
          totalRecommendations) *
        100
      : 0;
  const analystSellPercentage =
    analystRecommendations && totalRecommendations
      ? ((analystRecommendations[0].sell + analystRecommendations[0].strongSell) /
          totalRecommendations) *
        100
      : 0;
  const analystHoldPercentage =
    analystRecommendations && totalRecommendations
      ? (analystRecommendations[0].hold / totalRecommendations) * 100
      : 0;

  const getAnalystPercentages = () => {
    if (!analystRecommendations || !totalRecommendations) return {};
    return {
      buy: analystBuyPercentage,
      hold: analystHoldPercentage,
      sell: analystSellPercentage,
    };
  };

  const getAnalystSentiment = () => {
    if (!analystRecommendations) return "Hold";
    if (
      analystBuyPercentage > analystHoldPercentage &&
      analystBuyPercentage > analystSellPercentage
    )
      return "Buy";
    if (
      analystHoldPercentage > analystBuyPercentage &&
      analystHoldPercentage > analystSellPercentage
    )
      return "Hold";
    if (
      analystSellPercentage > analystBuyPercentage &&
      analystSellPercentage > analystHoldPercentage
    )
      return "Sell";
    return "Hold";
  };
  return (
    <LoaderComponent
      height="13rem"
      width="100%"
      loading={isLoading}
      className="bg-(--secondary-color) px-6 py-4 rounded-lg flex flex-col"
      rounded="lg"
      loadingClassName="bg-(--secondary-color)"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-bold ">Analyst Ratings</h2>
        <MdGroups className="text-(--accent-color)" size={20} />
      </div>
      {analystRecommendations ? (
        <div className="mt-2 flex flex-col h-full">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-2xl">{totalRecommendations} Analyst</h2>
            <AiTag
              tag={{
                sentiment:
                  getAnalystSentiment() === "Buy"
                    ? "Positive"
                    : getAnalystSentiment() === "Sell"
                    ? "Negative"
                    : "Neutral",
                topic: getAnalystSentiment() || "N/A",
              }}
              className="text-sm mt-1"
            />
          </div>
          <div className="h-full flex items-center ">
            <div
              className={cn(
                "text-3xl font-bold w-[90px] h-[90px] rounded-full flex items-center justify-center",
                getAnalystSentiment() === "Buy" && "bg-(--success-color)/20 text-(--success-color)",
                getAnalystSentiment() === "Sell" && "bg-(--danger-color)/20 text-(--danger-color)",
                getAnalystSentiment() === "Hold" && "bg-(--warning-color)/20 text-(--warning-color)"
              )}
            >
              <p>
                {Math.max(
                  analystBuyPercentage,
                  analystHoldPercentage,
                  analystSellPercentage
                ).toFixed(0)}
                %
              </p>
            </div>
            <div className="flex flex-col gap-5 flex-1 ml-4">
              {Object.keys(getAnalystPercentages()).map((key) => {
                const percentages = getAnalystPercentages();
                const sentimentScore = percentages[key as keyof typeof percentages] || 0;
                const color =
                  getAnalystSentiment() === "Buy" && key === "buy"
                    ? "var(--success-color)"
                    : getAnalystSentiment() === "Sell" && key === "sell"
                    ? "var(--danger-color)"
                    : getAnalystSentiment() === "Hold" && key === "hold"
                    ? "var(--warning-color)"
                    : "var(--secondary-text-color)";
                return (
                  <div className="flex items-center gap-2" key={key}>
                    <div className="bg-(--gray-accent-color) h-3 rounded w-full">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${sentimentScore}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <div className="w-20 flex-shrink-0 text-left text-sm">
                      <p style={{ color: color }}>
                        {sentimentScore.toFixed(0)}% {key.charAt(0).toUpperCase() + key.slice(1)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-(--secondary-text-color) mt-2">No analyst ratings data available.</p>
      )}
    </LoaderComponent>
  );
};

export default StockAnalystRatingsSection;
