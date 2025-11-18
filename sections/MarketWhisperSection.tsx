"use client";

import AiTag from "@/components/AiTag";
import Button from "@/components/general/Button";
import LoaderComponent from "@/components/general/LoaderComponent";
import Tooltip from "@/components/general/Tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMarketWhisper } from "@/lib/client/hooks/useMarketWhisper";
import { cn } from "@/lib/utils";
import { SentimentLabel } from "@/types";
import dayjs from "dayjs";
import { RefreshCcw } from "lucide-react";
import Image from "next/image";
import React from "react";
import { FaCircleInfo } from "react-icons/fa6";

const MarketWhisperSection = () => {
  const { data, loading, refresh, isRefreshing } = useMarketWhisper();
  const today = new Date();

  const isMobile = useIsMobile();

  return (
    <div className="bg-(--secondary-color) rounded-lg p-4  border-l-4 border-l-(--accent-color)">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-subheader-text flex items-center">
          <Image
            src="/stock_pulse_icon.png"
            alt="StockWisp logo"
            width={isMobile ? 20 : 25}
            height={isMobile ? 20 : 25}
            className="mr-2"
          />
          The Market Whisper
        </h1>

        <div className="flex gap-3 items-center ">
          {loading ? null : (
            <AiTag
              tag={{
                topic: data?.sentiment || "Neutral",
                sentiment:
                  data?.sentiment === "Bullish"
                    ? "Positive"
                    : data?.sentiment === "Bearish"
                    ? "Negative"
                    : "Neutral",
              }}
            />
          )}

          {!isMobile && (
            <>
              <Button
                className="font-bold !text-(--secondary-text-color) w-[15px] h-[15px]"
                variant="ghost"
                onClick={refresh}
                disabled={isRefreshing || loading}
              >
                <RefreshCcw className={isRefreshing ? "animate-spin" : ""} />
              </Button>
              <Tooltip
                className="max-w-[250px] text-center"
                side="left"
                content="AI-Generated daily market insights to keep you informed."
              >
                <FaCircleInfo className="text-(--secondary-text-color)" />
              </Tooltip>
            </>
          )}
        </div>
      </div>
      <LoaderComponent height="100px" width="100%" rounded="lg" loading={loading} className="mt-4">
        <p className="leading-7 text-sm md:text-base">
          {data?.summary ||
            "The Market Whisper provides daily insights into market sentiment, helping you stay ahead with concise summaries and analysis."}
        </p>
      </LoaderComponent>
      <div className="flex items-center justify-between md:mt-4">
        {/* <div className={cn("mt-4", isMobile && "flex justify-between items-center")}> */}
        <p className="text-xs md:text-sm font-normal text-(--secondary-text-color) ">
          {dayjs(today).format("MMMM DD, YYYY")}
        </p>
        <Button
          className={"font-bold !text-(--secondary-text-color) w-[15px] h-[15px] md:hidden"}
          variant="ghost"
          onClick={refresh}
          disabled={isRefreshing || loading}
        >
          <RefreshCcw className={isRefreshing ? "animate-spin" : ""} />
        </Button>
      </div>
    </div>
  );
};

export default MarketWhisperSection;
