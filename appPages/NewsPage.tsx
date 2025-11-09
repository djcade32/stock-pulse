import { track } from "@/lib/analytics";
import NewsContent from "@/sections/news/NewsContent";
import React from "react";

const NewsPage = () => {
  track("opened_news_page");
  return (
    <div className="page">
      <NewsContent />
    </div>
  );
};

export default NewsPage;
