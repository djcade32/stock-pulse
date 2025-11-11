import LoaderComponent from "@/components/general/LoaderComponent";
import Image from "next/image";
import React from "react";
import { FaCircleInfo } from "react-icons/fa6";

const MarketWhisperSection = () => {
  return (
    <LoaderComponent
      className="bg-(--secondary-color) rounded-lg p-4  border-l-4 border-l-(--accent-color)"
      height="190px"
      width="100%"
      rounded="lg"
      loading={false}
    >
      <div className="flex items-center justify-between">
        <h1 className="page-subheader-text flex items-center">
          <Image
            src="/stock_pulse_icon.png"
            alt="StockWisp logo"
            width={25}
            height={25}
            className="mr-2"
          />
          The Market Whisper
        </h1>
        <FaCircleInfo className="text-(--secondary-text-color)" />
      </div>
      <div>
        <p className=" mt-4">
          Futures are flat ahead of CPI at 8:30 AM ET, with markets showing cautious optimism. Tech
          leads premarket momentum as NVDA climbs 1.8% on continued AI demand while MSFT edges
          higher on Azure growth expectations. AMD and DELL track modestly positive, though AMZN
          remains mixed on retail concerns. VST and ANET show strength in networking infrastructure.
          Overall tone is cautiously bullish pending inflation data, with particular strength in
          your AI-focused holdings.{" "}
        </p>
      </div>
      <div className="mt-4">
        <p className="text-sm font-normal text-(--secondary-text-color) ">November 12, 2024</p>
      </div>
    </LoaderComponent>
  );
};

export default MarketWhisperSection;
