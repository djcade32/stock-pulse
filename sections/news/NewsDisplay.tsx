"use client";

import { Select } from "@/components/general/Select";
import NewsRow from "@/components/NewsRow";
import { News } from "@/types";
import React, { useEffect, useMemo, useState } from "react";

interface NewsDisplayProps {
  header: string;
  news: News[] | undefined;
  className?: string;
  isLoading?: boolean;
  companyOptions?: { label: string; value: string }[];
  companyFilter?: string | null;
  setCompanyFilter?: (value: string | null) => void;
}

const sentimentOptions = [
  { value: "all", label: "All Sentiments" },
  { value: "bullish", label: "Bullish" },
  { value: "neutral", label: "Neutral" },
  { value: "bearish", label: "Bearish" },
];

const NewsDisplay = ({
  header,
  className,
  news,
  isLoading,
  companyOptions,
  companyFilter,
  setCompanyFilter,
}: NewsDisplayProps) => {
  const [visibleNews, setVisibleNews] = useState(20);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const filteredNews = useMemo(() => {
    let filtered = news || [];
    console.log("company: ", companyFilter);
    if (companyFilter) {
      filtered = filtered.filter((item) => item.related.includes(companyFilter.toUpperCase()));
    }
    if (sourceFilter !== "all") {
      filtered = filtered.filter((item) => item.source.toLowerCase() === sourceFilter);
    }
    if (sentimentFilter !== "all") {
      filtered = filtered.filter(
        (item) =>
          (sentimentFilter === "bullish" && item.sentiment === "Positive") ||
          (sentimentFilter === "neutral" && item.sentiment === "Neutral") ||
          (sentimentFilter === "bearish" && item.sentiment === "Negative")
      );
    }
    setVisibleNews(20); // Reset visible news when filters change
    return filtered;
  }, [news, sourceFilter, sentimentFilter, companyFilter]);

  const sourceOptions = useMemo(() => {
    const options = [
      {
        value: "all",
        label: "All",
      },
    ];
    if (!news) return options;
    const sourcesSet = new Set(news.map((item) => item.source));
    sourcesSet.forEach((source) => {
      options.push({ value: source.toLowerCase(), label: source });
    });
    return options;
  }, [news]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        visibleNews < (news ? news.length : 0)
      ) {
        setVisibleNews((prev) => prev + 10);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleNews, news]);

  useEffect(() => {
    setVisibleNews(20); // Reset visible news when news data changes
  }, [news]);

  const handleSourceChange = (value: string) => {
    setSourceFilter(value);
  };

  const handleSentimentChange = (value: string) => {
    setSentimentFilter(value);
  };

  const handleCompanyChange = (value: string) => {
    setCompanyFilter && setCompanyFilter(value);
  };
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">{header}</h2>
        <div className="flex items-center gap-4">
          {!!companyOptions?.length && companyFilter && (
            <Select
              value={companyFilter && companyFilter.toLocaleLowerCase()}
              onValueChange={handleCompanyChange}
              items={companyOptions}
              scrollable
            />
          )}
          <Select value={sourceFilter} onValueChange={handleSourceChange} items={sourceOptions} />
          <Select
            value={sentimentFilter}
            onValueChange={handleSentimentChange}
            items={sentimentOptions}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          [...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-[105.5px] bg-(--secondary-color) rounded-lg animate-pulse"
            />
          ))
        ) : filteredNews.length === 0 ? (
          !!news?.length ? (
            <p className="text-(--secondary-text-color)">No matches for the selected filters.</p>
          ) : (
            <p className="text-(--secondary-text-color)">
              Your watchlist is empty. Add some stocks to see news.
            </p>
          )
        ) : (
          filteredNews?.slice(0, visibleNews)?.map((item, index) => (
            <div key={index} className="bg-(--secondary-color) rounded-lg p-4">
              <NewsRow news={item} isNewsPage />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsDisplay;
