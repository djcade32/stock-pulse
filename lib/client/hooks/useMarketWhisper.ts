import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { auth } from "@/firebase/client";
import { isUsMarketOpen } from "@/lib/utils";
// import { isUsMarketOpen } from "@/lib/utils";

dayjs.extend(utc);
dayjs.extend(timezone);

type Sentiment = "Bullish" | "Neutral" | "Bearish";
type Whisper = {
  summary: string;
  sentiment: Sentiment;
  generatedAt: string;
  date: string;
  cached: boolean;
};

const TZ = "America/New_York";
const dayKey = () => dayjs().tz(TZ).format("YYYY-MM-DD");

export function useMarketWhisper() {
  const key = `mw:${dayKey()}`;
  const [data, setData] = useState<Whisper | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem(key);
    let refresh = false;

    if (cached) {
      // Check how many minutes ago it was generated
      const parsed = JSON.parse(cached) as Whisper;
      const generatedAt = dayjs(parsed.generatedAt);
      const now = dayjs().tz(TZ);
      const diffMinutes = now.diff(generatedAt, "minute");

      // Check if generated before market open today
      // const marketOpenToday = isUsMarketOpen()
      //   ? now.startOf("day").add(9, "hour").add(30, "minute")
      //   : null;
      // const generatedBeforeMarketOpen = marketOpenToday
      //   ? generatedAt.isBefore(marketOpenToday)
      //   : false;
      // const generatedAfterMarketClose = marketOpenToday
      //   ? generatedAt.isAfter(marketOpenToday.add(6, "hour"))
      //   : false;

      const refreshTrheshold = isUsMarketOpen() ? 60 : 120;
      // If cached data is less than 60 minutes old, use it
      if (diffMinutes < refreshTrheshold) {
        try {
          setData(JSON.parse(cached));
        } catch {
          /* ignore parse error */
        } finally {
          setLoading(false);
          return;
        }
      }
      refresh = true;
    }

    (async () => {
      try {
        const token = await auth.currentUser!.getIdToken();
        const res = await fetch("/api/market-whisper/user", {
          cache: "no-store",
          method: "POST",
          headers: { "x-refresh": refresh ? "true" : "false", Authorization: `Bearer ${token}` },
        });
        const fresh = await res.json();
        setData(fresh);
        localStorage.setItem(key, JSON.stringify(fresh));
      } catch {
        // keep cached if fetch fails
      } finally {
        setLoading(false);
      }
    })();
  }, [key]);

  const refresh = async () => {
    setIsRefreshing(true);
    setLoading(true);
    const cached = localStorage.getItem(key);

    if (cached) {
      const parsed = JSON.parse(cached) as Whisper;
      const generatedAt = dayjs(parsed.generatedAt);
      const now = dayjs().tz(TZ);
      const diffMinutes = now.diff(generatedAt, "minute");

      if (diffMinutes < 15) {
        try {
          setData(JSON.parse(cached));
        } catch {
          /* ignore parse error */
        } finally {
          setTimeout(() => {
            setLoading(false);
            setIsRefreshing(false);
          }, 500);
          return;
        }
      }
    }

    try {
      const token = await auth.currentUser!.getIdToken();
      const res = await fetch("/api/market-whisper/user", {
        method: "POST",
        headers: { "x-refresh": "true", Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const fresh = await res.json();
      setData(fresh);
      localStorage.setItem(key, JSON.stringify(fresh));
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  return { data, loading, refresh, isRefreshing };
}
