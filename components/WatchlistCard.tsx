"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { FaNewspaper } from "react-icons/fa6";
import { FaMicrophoneAlt } from "react-icons/fa";
import { Ellipsis, Trash2 } from "lucide-react";
import AiTag from "./AiTag";
import { useCompanyLogo } from "@/lib/client/hooks/useCompanyLogo";
import DropdownMenu from "./general/DropdownMenu";
import useWatchlistStore from "@/stores/watchlist-store";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useUid } from "@/hooks/useUid";
import { WatchlistCard as WatchlistCardType } from "@/types";

interface WatchlistCardProps {
  stock: WatchlistCardType;
  fullDetails?: boolean;
}

export const WatchlistCard = ({ stock, fullDetails = true }: WatchlistCardProps) => {
  const {
    name,
    ticker,
    price,
    percentChange,
    dollarChange,
    sentimentScore,
    numOfNews,
    aiTags = [],
    sentimentSummary,
    type,
  } = stock;

  const { url: logoUrl } = useCompanyLogo(ticker);
  const { removeFromWatchlist, watchlist } = useWatchlistStore();
  const { uid } = useUid();

  const isPositiveChange = percentChange >= 0;

  const getSentiment = (score: number) => {
    if (score >= 70) return "Bullish";
    if (score >= 50) return "Neutral";
    return "Bearish";
  };

  const handleRemove = async () => {
    // Implement the logic to remove the stock from the watchlist
    console.log(`Removing ${ticker} from watchlist`);
    removeFromWatchlist(ticker);
    // Remove from firebase as well
    const ref = doc(db, "watchlists", uid!);
    await setDoc(
      ref,
      {
        uid,
        stocks: watchlist.filter((s) => s.symbol !== ticker),
      },
      { merge: true }
    );
  };

  return (
    <div className="group card flex-col justify-between h-full">
      <Ellipsis className="absolute top-0 right-4 text-(--secondary-text-color) opacity-0 group-hover:opacity-100 hover:brightness-125 cursor-pointer smooth-animation" />
      <div className="flex flex-col w-full flex-1">
        <div className="flex justify-between w-full">
          <div className="flex gap-2 w-full">
            <Link href={`/stocks/${ticker}`} className="flex-shrink-0">
              {logoUrl.data ? (
                <img
                  src={logoUrl.data}
                  alt={`${ticker} logo`}
                  className="!w-10 h-10 rounded-lg bg-white bg-cover"
                />
              ) : (
                //   <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
                <div className="w-10 h-10 rounded-lg bg-(--secondary-text-color) text-foreground font-bold flex items-center justify-center">
                  <p>{ticker[0]}</p>
                </div>
              )}
            </Link>
            <div className="flex flex-col justify-between w-full">
              <Link
                href={`/stocks/${ticker}`}
                className="hover:brightness-75 transition-all duration-200"
              >
                <h3 className="font-bold">{ticker}</h3>
              </Link>
              <p className="text-xs text-(--secondary-text-color) font-medium text-ellipsis w-[90%] overflow-hidden text-nowrap">
                {name}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            <h3 className="font-bold">${price}</h3>

            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                isPositiveChange ? "text-(--success-color)" : "text-(--danger-color)"
              }`}
            >
              <p>
                {isPositiveChange ? "+" : "-"}
                {dollarChange}
              </p>
              <p>
                ({isPositiveChange && "+"}
                {percentChange}%)
              </p>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 flex flex-col flex-1 min-h-0">
          <div>
            <div className="text-sm flex items-center justify-between">
              <p className="text-(--secondary-text-color) font-bold ">Sentiment Score</p>
              <p
                className={cn(
                  "text-(--warning-color) font-medium",
                  getSentiment(sentimentScore) === "Bullish" && "text-(--success-color)",
                  getSentiment(sentimentScore) === "Bearish" && "text-(--danger-color)"
                )}
              >
                {sentimentScore} {getSentiment(sentimentScore)}
              </p>
            </div>
            <div className="bg-(--gray-accent-color) h-2 rounded mt-1">
              <div
                className="h-full rounded"
                style={{
                  width: `${sentimentScore}%`,
                  backgroundColor:
                    getSentiment(sentimentScore) === "Bullish"
                      ? "var(--success-color)"
                      : getSentiment(sentimentScore) === "Bearish"
                      ? "var(--danger-color)"
                      : "var(--warning-color)",
                }}
              />
            </div>
          </div>

          <div
            className="flex items-center mt-4 gap-1 flex-wrap overflow-hidden"
            style={{ maxHeight: "calc(2 * (1.5rem + 0.25rem))" }}
          >
            {aiTags.length > 0 && aiTags.map((tag, index) => <AiTag key={index} tag={tag} />)}
          </div>

          <div className="flex-1 min-h-0 mt-2">
            <p
              className="text-sm text-(--secondary-text-color) leading-tight h-full overflow-hidden pr-1 text-ellipsis"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {sentimentSummary}
            </p>
          </div>
        </div>
      </div>

      <DropdownMenu
        className="w-10 bg-(--secondary-color) shadow-lg border border-(--gray-accent-color)"
        renderTrigger={
          <Ellipsis className="absolute top-0 right-4 text-(--secondary-text-color) opacity-0 group-hover:opacity-100 hover:brightness-125 cursor-pointer smooth-animation" />
        }
        items={[
          {
            icon: <Trash2 size={12} color="var(--danger-color" />,
            label: "Remove",
            onClick: handleRemove,
          },
        ]}
        side="right"
      />

      {fullDetails ? (
        <div className="flex justify-between mt-4 w-full">
          <Link href={`/news/${ticker}`} className="watchlist-card-link">
            <FaNewspaper size={15} className="mr-1" />
            News ({numOfNews})
          </Link>
          {type == "Common Stock" && (
            <Link href={`/news/${ticker}`} className="watchlist-card-link">
              <FaMicrophoneAlt size={15} className="mr-1" />
              Earnings
            </Link>
          )}
        </div>
      ) : (
        // <Button className="mt-4">
        <Link href={`/stocks/${ticker}`} className="flex items-center justify-center gap-2">
          Learn More
        </Link>
        // </Button>
      )}
    </div>
  );
};

export default WatchlistCard;

// "use client";

// import React, { useLayoutEffect, useRef, useState } from "react";
// import { cn } from "@/lib/utils";
// import Link from "next/link";
// import { FaNewspaper } from "react-icons/fa6";
// import { FaMicrophoneAlt } from "react-icons/fa";
// import { Ellipsis, Trash2 } from "lucide-react";
// import AiTag from "./AiTag";
// import { useCompanyLogo } from "@/lib/client/hooks/useCompanyLogo";
// import DropdownMenu from "./general/DropdownMenu";
// import useWatchlistStore from "@/stores/watchlist-store";
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "@/firebase/client";
// import { useUid } from "@/hooks/useUid";
// import { AITag, WatchlistCard as WatchlistCardType } from "@/types";

// /**
//  * TagList — renders tags, limits to 2 visual rows, and appends "+X more"
//  */
// function TagList({ tags }: { tags: AITag[] }) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [visible, setVisible] = useState<AITag[]>(tags);
//   const [hiddenCount, setHiddenCount] = useState(0);

//   useLayoutEffect(() => {
//     const container = containerRef.current;
//     if (!container) return;

//     const measure = () => {
//       // Render all tags first so we can measure them accurately
//       setVisible(tags);
//       setHiddenCount(0);

//       requestAnimationFrame(() => {
//         const children = Array.from(container.children) as HTMLElement[];
//         if (children.length === 0) return;

//         // Collect unique row tops (each new offsetTop indicates a new row)
//         const rowTops: number[] = [];
//         for (const el of children) {
//           const top = el.offsetTop;
//           if (!rowTops.includes(top)) rowTops.push(top);
//         }

//         // If more than 2 rows, find the index where the 3rd row starts
//         if (rowTops.length > 2) {
//           const thirdRowTop = rowTops.sort((a, b) => a - b)[2];
//           const cutoffIndex = children.findIndex((el) => el.offsetTop >= thirdRowTop);
//           if (cutoffIndex > -1) {
//             setVisible(tags.slice(0, cutoffIndex));
//             setHiddenCount(tags.length - cutoffIndex);
//           }
//         }
//       });
//     };

//     measure();

//     // Recalculate on resize / container changes
//     const ro = new ResizeObserver(measure);
//     ro.observe(container);
//     window.addEventListener("resize", measure);

//     return () => {
//       ro.disconnect();
//       window.removeEventListener("resize", measure);
//     };
//   }, [tags]);

//   if (!tags?.length) return null;

//   return (
//     <div
//       ref={containerRef}
//       className="flex items-center mt-4 gap-1 flex-wrap overflow-hidden"
//       // Optional: soft cap height to visually clamp to ~2 rows (tweak as needed)
//       style={{ maxHeight: "3.6rem" }} /* ~2 rows depending on tag size & gap */
//     >
//       {visible.map((tag, i) => (
//         <AiTag key={`${tag}-${i}`} tag={tag} />
//       ))}
//       {hiddenCount > 0 && (
//         <span className="text-xs px-2 py-1 rounded-full bg-(--gray-accent-color) text-(--secondary-text-color)">
//           +{hiddenCount} more
//         </span>
//       )}
//     </div>
//   );
// }

// interface WatchlistCardProps {
//   stock: WatchlistCardType;
//   fullDetails?: boolean;
// }

// export const WatchlistCard = ({ stock, fullDetails = true }: WatchlistCardProps) => {
//   const {
//     name,
//     ticker,
//     price,
//     percentChange,
//     dollarChange,
//     sentimentScore,
//     numOfNews,
//     aiTags = [],
//     sentimentSummary,
//     type,
//   } = stock;

//   const { url: logoUrl } = useCompanyLogo(ticker);
//   const { removeFromWatchlist, watchlist } = useWatchlistStore();
//   const { uid } = useUid();

//   const isPositiveChange = percentChange >= 0;

//   const getSentiment = (score: number) => {
//     if (score >= 70) return "Bullish";
//     if (score >= 50) return "Neutral";
//     return "Bearish";
//   };

//   const handleRemove = async () => {
//     console.log(`Removing ${ticker} from watchlist`);
//     removeFromWatchlist(ticker);
//     const ref = doc(db, "watchlists", uid!);
//     await setDoc(
//       ref,
//       {
//         uid,
//         stocks: watchlist.filter((s) => s.symbol !== ticker),
//       },
//       { merge: true }
//     );
//   };

//   return (
//     <div className="group card flex-col justify-between">
//       <Ellipsis className="absolute top-0 right-4 text-(--secondary-text-color) opacity-0 group-hover:opacity-100 hover:brightness-125 cursor-pointer smooth-animation" />
//       <div className="flex flex-col w-full">
//         <div className="flex justify-between w-full">
//           <div className="flex gap-2 w-full">
//             <Link href={`/stocks/${ticker}`} className="flex-shrink-0">
//               {logoUrl.data ? (
//                 <img
//                   src={logoUrl.data}
//                   alt={`${ticker} logo`}
//                   className="!w-10 h-10 rounded-lg bg-white bg-cover"
//                 />
//               ) : (
//                 <div className="w-10 h-10 rounded-lg bg-(--secondary-text-color) text-foreground font-bold flex items-center justify-center">
//                   <p>{ticker[0]}</p>
//                 </div>
//               )}
//             </Link>
//             <div className="flex flex-col justify-between w-full">
//               <Link
//                 href={`/stocks/${ticker}`}
//                 className="hover:brightness-75 transition-all duration-200"
//               >
//                 <h3 className="font-bold">{ticker}</h3>
//               </Link>
//               <p className="text-xs text-(--secondary-text-color) font-medium text-ellipsis w-[90%] overflow-hidden text-nowrap">
//                 {name}
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-col items-end flex-shrink-0">
//             <h3 className="font-bold">${price}</h3>

//             <div
//               className={cn(
//                 "flex items-center gap-1 text-xs font-medium",
//                 isPositiveChange ? "text-(--success-color)" : "text-(--danger-color)"
//               )}
//             >
//               <p>
//                 {isPositiveChange ? "+" : "-"}
//                 {dollarChange}
//               </p>
//               <p>
//                 ({isPositiveChange && "+"}
//                 {percentChange}%)
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="w-full mt-4">
//           <div>
//             <div className="text-sm flex items-center justify-between">
//               <p className="text-(--secondary-text-color) font-bold ">Sentiment Score</p>
//               <p
//                 className={cn(
//                   "text-(--warning-color) font-medium",
//                   getSentiment(sentimentScore) === "Bullish" && "text-(--success-color)",
//                   getSentiment(sentimentScore) === "Bearish" && "text-(--danger-color)"
//                 )}
//               >
//                 {sentimentScore} {getSentiment(sentimentScore)}
//               </p>
//             </div>
//             <div className="bg-(--gray-accent-color) h-2 rounded mt-1">
//               <div
//                 className="h-full rounded"
//                 style={{
//                   width: `${sentimentScore}%`,
//                   backgroundColor:
//                     getSentiment(sentimentScore) === "Bullish"
//                       ? "var(--success-color)"
//                       : getSentiment(sentimentScore) === "Bearish"
//                       ? "var(--danger-color)"
//                       : "var(--warning-color)",
//                 }}
//               />
//             </div>
//           </div>

//           {/* Tags limited to 2 rows with +X more */}
//           <TagList tags={aiTags} />

//           <div>
//             <p className="text-sm text-(--secondary-text-color) mt-4 leading-tight">
//               {sentimentSummary.length > 100
//                 ? `${sentimentSummary.slice(0, 100)}...`
//                 : sentimentSummary}
//             </p>
//           </div>
//         </div>
//       </div>

//       <DropdownMenu
//         className="w-10 bg-(--secondary-color) shadow-lg border border-(--gray-accent-color)"
//         renderTrigger={
//           <Ellipsis className="absolute top-0 right-4 text-(--secondary-text-color) opacity-0 group-hover:opacity-100 hover:brightness-125 cursor-pointer smooth-animation" />
//         }
//         items={[
//           {
//             icon: <Trash2 size={12} color="var(--danger-color" />,
//             label: "Remove",
//             onClick: handleRemove,
//           },
//         ]}
//         side="right"
//       />

//       {fullDetails ? (
//         <div className="flex justify-between mt-4 w-full">
//           <Link href={`/news/${ticker}`} className="watchlist-card-link">
//             <FaNewspaper size={15} className="mr-1" />
//             News ({numOfNews})
//           </Link>
//           {type == "Common Stock" && (
//             <Link href={`/news/${ticker}`} className="watchlist-card-link">
//               <FaMicrophoneAlt size={15} className="mr-1" />
//               Earnings
//             </Link>
//           )}
//         </div>
//       ) : (
//         <Link href={`/stocks/${ticker}`} className="flex items-center justify-center gap-2">
//           Learn More
//         </Link>
//       )}
//     </div>
//   );
// };

// export default WatchlistCard;
