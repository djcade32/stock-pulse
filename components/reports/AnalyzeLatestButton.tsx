// /components/reports/AnalyzeLatestButton.tsx
"use client";

import { useState } from "react";
import Button from "@/components/general/Button";
import { useAnalyzeLatestReport } from "@/lib/client/mutations/useAnalyzeLatestReport";

export default function AnalyzeLatestButton() {
  const [ticker, setTicker] = useState("");
  const { mutate, isPending, error } = useAnalyzeLatestReport();

  return (
    <div className="flex items-center gap-2">
      <input
        className="px-3 py-2 rounded-md bg-(--secondary-color) text-sm outline-none"
        placeholder="Enter ticker (e.g., NVDA)"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
      />
      <Button disabled={!ticker || isPending} onClick={() => mutate({ ticker })}>
        {isPending ? "Analyzing…" : "Analyze latest 10-Q/10-K"}
      </Button>
      {error ? <span className="text-red-500 text-sm">{(error as Error).message}</span> : null}
    </div>
  );
}
