"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StockSearch from "@/components/StockSearch";
import { Select } from "@/components/general/Select";
import { ReportRowDTO, StockHit } from "@/types";
import { useReportsFeedInfinite } from "@/lib/client/queries/reports";

import Button from "@/components/general/Button";
import { FileSearch } from "lucide-react";
import CompareEarningsCard from "@/components/earnings/CompareEarningsCard";
import { useCompareFilings } from "@/lib/client/queries/compareFilings";
import CompareEarningsAICard from "@/components/earnings/CompareEarningsAICard";

const CompareEarningsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sA = searchParams?.get("sA")?.toLocaleUpperCase();
  const quarterA = searchParams?.get("quarterA");
  const yearA = searchParams?.get("yearA");

  const [stockA, setStockA] = useState(sA || "");
  const [quarterFilterA, setQuarterFilterA] = useState(quarterA || "");
  const [yearFilterA, setYearFilterA] = useState(yearA || "");
  const [currentReportA, setCurrentReportA] = useState<ReportRowDTO | null>(null);

  const sB = searchParams?.get("sB")?.toLocaleUpperCase();
  const quarterB = searchParams?.get("quarterB");
  const yearB = searchParams?.get("yearB");

  const [stockB, setStockB] = useState(sB || "");
  const [quarterFilterB, setQuarterFilterB] = useState(quarterB || "");
  const [yearFilterB, setYearFilterB] = useState(yearB || "");
  const [currentReportB, setCurrentReportB] = useState<ReportRowDTO | null>(null);

  const {
    data: stockAData,
    isLoading: isLoadingStockAData,
    isFetching: isFetchingStockAData,
  } = useReportsFeedInfinite(30, stockA, "", "", !!stockA);
  const stockARows = (stockAData?.pages ?? []).flatMap((p) => p.rows);

  const {
    data: stockBData,
    isLoading: isLoadingStockBData,
    isFetching: isFetchingStockBData,
  } = useReportsFeedInfinite(30, stockB, "", "", !!stockB);
  const stockBRows = (stockBData?.pages ?? []).flatMap((p) => p.rows);

  const { isFetching: isFetchingCompare, refetch: refetchCompare } = useCompareFilings(
    currentReportA,
    currentReportB,
    false
  );

  useEffect(() => {
    if (!!stockARows.length) {
      const foundReport = stockARows.find((row) => row.quarter === `10-Q ${quarterA} ${yearA}`);
      if (foundReport) setCurrentReportA(foundReport);
    } else {
      setCurrentReportA(null);
    }
  }, [stockARows]);

  useEffect(() => {
    if (!!stockBRows.length) {
      const foundReport = stockBRows.find((row) => row.quarter === `10-Q ${quarterB} ${yearB}`);
      if (foundReport) setCurrentReportB(foundReport);
    } else {
      setCurrentReportB(null);
    }
  }, [stockARows]);

  const getAvailableYears = (rows: ReportRowDTO[]) => {
    const years: string[] = [];
    rows.forEach((row) => {
      const year = new Date(row.date).getFullYear().toString();
      if (!years.includes(year)) years.push(year);
    });
    // Convert to options
    const options = years.map((year) => {
      return {
        label: year,
        value: year,
      };
    });
    return options;
  };

  const getAvailableQuarters = (rows: ReportRowDTO[], year: string) => {
    const quarters: string[] = [];
    rows
      .filter((row) => new Date(row.date).getFullYear().toString() === year)
      .forEach((row) => {
        const quarter = row.quarter.split(" ")[1];
        if (!quarters.includes(quarter)) quarters.push(quarter);
      });
    // Convert to options
    const options = quarters.map((quarter) => {
      return {
        label: quarter,
        value: quarter,
      };
    });
    return options;
  };

  const changeYearFilter = (value: string, filter: "A" | "B") => {
    if (filter === "A") {
      setYearFilterA(value);
      router.replace(
        `/earnings/compare?sA=${stockA}&yearA=${value}&quarterA=${quarterFilterA}&sB=${stockB}&yearB=${yearFilterB}&quarterB=${quarterFilterB}`
      );
    } else {
      setYearFilterB(value);
      router.replace(
        `/earnings/compare?sA=${stockA}&yearA=${yearFilterA}&quarterA=${quarterFilterA}&sB=${stockB}&yearB=${value}&quarterB=${quarterFilterB}`
      );
    }
  };

  const changeQuarterFilter = (value: string, filter: "A" | "B") => {
    if (filter === "A") {
      setQuarterFilterA(value);
      router.replace(
        `/earnings/compare?sA=${stockA}&yearA=${yearFilterA}&quarterA=${value}&sB=${stockB}&yearB=${yearFilterB}&quarterB=${quarterFilterB}`
      );
    } else {
      setQuarterFilterB(value);
      router.replace(
        `/earnings/compare?sA=${stockA}&yearA=${yearFilterA}&quarterA=${quarterFilterA}&sB=${stockB}&yearB=${yearFilterB}&quarterB=${value}`
      );
    }
  };

  const changeStock = (value: string, filter: "A" | "B") => {
    if (filter === "A") {
      setStockA(value);
      router.replace(
        `/earnings/compare?sA=${value}&yearA=&quarterA=&sB=${stockB}&yearB=${yearFilterB}&quarterB=${quarterFilterB}`
      );
      setYearFilterA("");
      setQuarterFilterA("");
    } else {
      setStockB(value);
      router.replace(
        `/earnings/compare?sA=${stockA}&yearA=${yearFilterA}&quarterA=${quarterFilterA}&sB=${value}&yearB=&quarterB=`
      );
      setYearFilterB("");
      setQuarterFilterB("");
    }
  };

  const handleCompareClick = () => {
    refetchCompare();
  };

  return (
    <div className="page">
      <h1 className="page-header-text">Compare Earnings</h1>

      <div className="bg-(--secondary-color) p-4 rounded-lg">
        <div className="flex gap-4 justify-center">
          <div className="flex flex-col flex-1">
            <p className="mb-1">Select Company A</p>
            <StockSearch
              inputClassName="bg-(--background) h-10"
              value={stockA}
              onSelect={(e) => changeStock((e as StockHit).symbol, "A")}
            />
            <div className="flex gap-2 w-[50%] mt-2">
              <Select
                value={yearFilterA}
                onValueChange={(value) => changeYearFilter(value, "A")}
                items={getAvailableYears(stockARows)}
                className="bg-(--background)"
              />
              <Select
                value={quarterFilterA}
                onValueChange={(value) => changeQuarterFilter(value, "A")}
                items={getAvailableQuarters(stockARows, yearFilterA)}
                className="bg-(--background)"
              />
            </div>
          </div>
          <div className="flex flex-col flex-1">
            <p className="mb-1">Select Company B</p>
            <StockSearch
              inputClassName="bg-(--background) h-10"
              value={stockB}
              onSelect={(e) => changeStock((e as StockHit).symbol, "B")}
            />
            <div className="flex gap-2 w-[50%] mt-2">
              <Select
                value={yearFilterB}
                onValueChange={(value) => changeYearFilter(value, "B")}
                items={getAvailableYears(stockBRows)}
                className="bg-(--background)"
              />
              <Select
                value={quarterFilterB}
                onValueChange={(value) => changeQuarterFilter(value, "B")}
                items={getAvailableQuarters(stockBRows, yearFilterB)}
                className="bg-(--background)"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleCompareClick}
            disabled={!currentReportA || !currentReportB}
            showLoading={isFetchingCompare}
            className="w-[175px]"
          >
            <FileSearch />
            <p>Compare Earnings</p>
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <CompareEarningsCard
          stock={stockA}
          report={currentReportA}
          isLoading={isLoadingStockAData}
          isFetching={isFetchingStockAData}
        />
        <CompareEarningsCard
          stock={stockB}
          report={currentReportB}
          isLoading={isLoadingStockBData}
          isFetching={isFetchingStockBData}
        />
      </div>
      <CompareEarningsAICard currentReportA={currentReportA} currentReportB={currentReportB} />
    </div>
  );
};

export default CompareEarningsPage;

// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { useSearchParams, useRouter, usePathname } from "next/navigation";
// import StockSearch from "@/components/StockSearch";
// import { Select } from "@/components/general/Select";
// import { ReportRowDTO, StockHit } from "@/types";
// import { useReportsFeedInfinite } from "@/lib/client/queries/reports";
// import Button from "@/components/general/Button";
// import { FileSearch } from "lucide-react";
// import CompareEarningsCard from "@/components/earnings/CompareEarningsCard";
// import { useCompareFilings } from "@/lib/client/queries/compareFilings";
// import CompareEarningsAICard from "@/components/earnings/CompareEarningsAICard";

// // 🚫 Stop build-time prerender; render at request time only (avoids QueryClient missing during build)
// export const dynamic = "force-dynamic";

// const CompareEarningsPage = () => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // --- read URL params (uppercasing symbols) ---
//   const sA = (searchParams?.get("sA") || "").toUpperCase();
//   const quarterA = searchParams?.get("quarterA") || "";
//   const yearA = searchParams?.get("yearA") || "";

//   const sB = (searchParams?.get("sB") || "").toUpperCase();
//   const quarterB = searchParams?.get("quarterB") || "";
//   const yearB = searchParams?.get("yearB") || "";

//   // --- local state for UI controls ---
//   const [stockA, setStockA] = useState(sA);
//   const [quarterFilterA, setQuarterFilterA] = useState(quarterA);
//   const [yearFilterA, setYearFilterA] = useState(yearA);
//   const [currentReportA, setCurrentReportA] = useState<ReportRowDTO | null>(null);

//   const [stockB, setStockB] = useState(sB);
//   const [quarterFilterB, setQuarterFilterB] = useState(quarterB);
//   const [yearFilterB, setYearFilterB] = useState(yearB);
//   const [currentReportB, setCurrentReportB] = useState<ReportRowDTO | null>(null);

//   // --- data ---
//   const {
//     data: stockAData,
//     isLoading: isLoadingStockAData,
//     isFetching: isFetchingStockAData,
//   } = useReportsFeedInfinite(30, stockA, "", "", !!stockA);
//   const stockARows = useMemo(() => (stockAData?.pages ?? []).flatMap((p) => p.rows), [stockAData]);

//   const {
//     data: stockBData,
//     isLoading: isLoadingStockBData,
//     isFetching: isFetchingStockBData,
//   } = useReportsFeedInfinite(30, stockB, "", "", !!stockB);
//   const stockBRows = useMemo(() => (stockBData?.pages ?? []).flatMap((p) => p.rows), [stockBData]);

//   const { isFetching: isFetchingCompare, refetch: refetchCompare } = useCompareFilings(
//     currentReportA,
//     currentReportB,
//     false
//   );

//   // --- helpers ---
//   const toOptions = (arr: string[]) => arr.map((v) => ({ label: v, value: v }));

//   const getAvailableYears = (rows: ReportRowDTO[]) => {
//     const set = new Set<string>();
//     rows.forEach((r) => set.add(new Date(r.date).getFullYear().toString()));
//     return toOptions(Array.from(set).sort((a, b) => Number(b) - Number(a)));
//   };

//   const getAvailableQuarters = (rows: ReportRowDTO[], year: string) => {
//     if (!year) return [];
//     const set = new Set<string>();
//     rows
//       .filter((r) => new Date(r.date).getFullYear().toString() === year)
//       .forEach((r) => {
//         const q = r.quarter.split(" ")[1]; // "10-Q Q1 2025" -> "Q1"
//         if (q) set.add(q);
//       });
//     return toOptions(Array.from(set));
//   };

//   // Single place to update URL query without full reload
//   const replaceQuery = (updates: Record<string, string>) => {
//     const qp = new URLSearchParams(searchParams?.toString());
//     Object.entries(updates).forEach(([k, v]) => {
//       if (v === "" || v == null) qp.delete(k);
//       else qp.set(k, v);
//     });
//     router.replace(`${pathname}?${qp.toString()}`, { scroll: false });
//   };

//   // --- effects: sync current report selection based on rows + filters ---
//   useEffect(() => {
//     if (stockARows.length && yearFilterA && quarterFilterA) {
//       const match = stockARows.find(
//         (row) => row.quarter === `10-Q ${quarterFilterA} ${yearFilterA}`
//       );
//       setCurrentReportA(match ?? null);
//     } else {
//       setCurrentReportA(null);
//     }
//   }, [stockARows, yearFilterA, quarterFilterA]);

//   useEffect(() => {
//     if (stockBRows.length && yearFilterB && quarterFilterB) {
//       const match = stockBRows.find(
//         (row) => row.quarter === `10-Q ${quarterFilterB} ${yearFilterB}`
//       );
//       setCurrentReportB(match ?? null);
//     } else {
//       setCurrentReportB(null);
//     }
//   }, [stockBRows, yearFilterB, quarterFilterB]); // ✅ was incorrectly depending on stockARows before

//   // --- handlers that update both state and URL ---
//   const changeYearFilter = (value: string, which: "A" | "B") => {
//     if (which === "A") {
//       setYearFilterA(value);
//       replaceQuery({ sA: stockA, yearA: value, quarterA: quarterFilterA, sB: stockB, yearB: yearFilterB, quarterB: quarterFilterB });
//     } else {
//       setYearFilterB(value);
//       replaceQuery({ sA: stockA, yearA: yearFilterA, quarterA: quarterFilterA, sB: stockB, yearB: value, quarterB: quarterFilterB });
//     }
//   };

//   const changeQuarterFilter = (value: string, which: "A" | "B") => {
//     if (which === "A") {
//       setQuarterFilterA(value);
//       replaceQuery({ sA: stockA, yearA: yearFilterA, quarterA: value, sB: stockB, yearB: yearFilterB, quarterB: quarterFilterB });
//     } else {
//       setQuarterFilterB(value);
//       replaceQuery({ sA: stockA, yearA: yearFilterA, quarterA: quarterFilterA, sB: stockB, yearB: yearFilterB, quarterB: value });
//     }
//   };

//   const changeStock = (value: string, which: "A" | "B") => {
//     const sym = value.toUpperCase();
//     if (which === "A") {
//       setStockA(sym);
//       setYearFilterA("");
//       setQuarterFilterA("");
//       replaceQuery({ sA: sym, yearA: "", quarterA: "", sB: stockB, yearB: yearFilterB, quarterB: quarterFilterB });
//     } else {
//       setStockB(sym);
//       setYearFilterB("");
//       setQuarterFilterB("");
//       replaceQuery({ sA: stockA, yearA: yearFilterA, quarterA: quarterFilterA, sB: sym, yearB: "", quarterB: "" });
//     }
//   };

//   const handleCompareClick = () => {
//     refetchCompare();
//   };

//   // --- render ---
//   return (
//     <div className="page">
//       <h1 className="page-header-text">Compare Earnings</h1>

//       <div className="bg-(--secondary-color) p-4 rounded-lg">
//         <div className="flex gap-4 justify-center">
//           <div className="flex flex-col flex-1">
//             <p className="mb-1">Select Company A</p>
//             <StockSearch
//               inputClassName="bg-(--background) h-10"
//               value={stockA}
//               onSelect={(e) => changeStock((e as StockHit).symbol, "A")}
//             />
//             <div className="flex gap-2 w-[50%] mt-2">
//               <Select
//                 value={yearFilterA}
//                 onValueChange={(v) => changeYearFilter(v, "A")}
//                 items={getAvailableYears(stockARows)}
//                 className="bg-(--background)"
//               />
//               <Select
//                 value={quarterFilterA}
//                 onValueChange={(v) => changeQuarterFilter(v, "A")}
//                 items={getAvailableQuarters(stockARows, yearFilterA)}
//                 className="bg-(--background)"
//               />
//             </div>
//           </div>
//           <div className="flex flex-col flex-1">
//             <p className="mb-1">Select Company B</p>
//             <StockSearch
//               inputClassName="bg-(--background) h-10"
//               value={stockB}
//               onSelect={(e) => changeStock((e as StockHit).symbol, "B")}
//             />
//             <div className="flex gap-2 w-[50%] mt-2">
//               <Select
//                 value={yearFilterB}
//                 onValueChange={(v) => changeYearFilter(v, "B")}
//                 items={getAvailableYears(stockBRows)}
//                 className="bg-(--background)"
//               />
//               <Select
//                 value={quarterFilterB}
//                 onValueChange={(v) => changeQuarterFilter(v, "B")}
//                 items={getAvailableQuarters(stockBRows, yearFilterB)}
//                 className="bg-(--background)"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 flex justify-center">
//           <Button
//             onClick={handleCompareClick}
//             disabled={!currentReportA || !currentReportB}
//             showLoading={isFetchingCompare}
//             className="w-[175px]"
//           >
//             <FileSearch />
//             <p>Compare Earnings</p>
//           </Button>
//         </div>
//       </div>

//       <div className="flex gap-4 mt-4">
//         <CompareEarningsCard
//           stock={stockA}
//           report={currentReportA}
//           isLoading={isLoadingStockAData}
//           isFetching={isFetchingStockAData}
//         />
//         <CompareEarningsCard
//           stock={stockB}
//           report={currentReportB}
//           isLoading={isLoadingStockBData}
//           isFetching={isFetchingStockBData}
//         />
//       </div>

//       <CompareEarningsAICard currentReportA={currentReportA} currentReportB={currentReportB} />
//     </div>
//   );
// };

// export default CompareEarningsPage;
