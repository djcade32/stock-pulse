import LoaderComponent from "@/components/general/LoaderComponent";
import NewsRow from "@/components/NewsRow";
import { useFetchCompanyNews } from "@/lib/client/hooks/useFetchCompanyNews";
import React from "react";
import { Button as RootButton } from "@/components/ui/button";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";

interface StockNewsSectionProps {
  symbol: string;
}

const StockNewsSection = ({ symbol }: StockNewsSectionProps) => {
  const { data, isLoading } = useFetchCompanyNews(symbol);
  const isMobile = useIsMobile();

  return (
    <div>
      <LoaderComponent
        height="13rem"
        width="100%"
        loading={isLoading}
        className="bg-(--secondary-color) px-6 py-4 rounded-lg flex flex-col gap-6 md:gap-4"
        rounded="lg"
        loadingClassName="bg-(--secondary-color)"
      >
        <h2 className="text-lg md:text-xl font-bold">Recent News</h2>
        {data && data.length > 0 ? (
          data
            .slice(0, isMobile ? 4 : 8)
            .map((newsItem, index) => <NewsRow key={index} news={newsItem} isNewsPage />)
        ) : (
          <p className="text-(--secondary-text-color) text-center">
            No recent news for {symbol}. Check back later.
          </p>
        )}
        <div className="flex justify-center">
          <RootButton
            asChild
            className="text-(--accent-color) hover:brightness-125 transition-all duration-200"
          >
            <Link href={`/news?q=${symbol}`}>
              <p>View All News</p>
            </Link>
          </RootButton>
        </div>
      </LoaderComponent>
    </div>
  );
};

export default StockNewsSection;
