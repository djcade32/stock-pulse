"use client";

import { useEffect, useMemo, useState } from "react";
import { useLastEnsuredAt } from "@/lib/client/hooks/useLastEnsuredAt";

function formatRelative(from: Date, to: Date) {
  const diffMs = to.getTime() - from.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export default function LastRefreshedBadge() {
  const last = useLastEnsuredAt();
  const [now, setNow] = useState(new Date());

  // tick every 30s so the text stays fresh
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const label = useMemo(() => {
    if (!last) return "never";
    return formatRelative(last, now);
  }, [last, now]);

  return (
    <div className="items-center gap-2 text-xs px-2 py-1 rounded-md bg-(--secondary-color) text-(--secondary-text-color) max-h-fit hidden md:inline-flex">
      <span className="inline-block h-2 w-2 rounded-full bg-(--accent-color)" />
      <span>Last refreshed: {label}</span>
    </div>
  );
}
