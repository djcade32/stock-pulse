"use client";

import { db } from "@/firebase/client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { useEffect, useMemo, useState } from "react";
import { isUsMarketOpen } from "@/lib/utils";

dayjs.extend(utc);
dayjs.extend(tz);

const TZ = "America/New_York";

function etDate(d = new Date()) {
  return dayjs(d).tz(TZ).format("YYYY-MM-DD");
}

type Tick = { t: number; p: number };

export function useIndexSeries(symbols: string[]) {
  const [seriesBySymbol, setSeries] = useState<Record<string, Tick[]>>({});
  const [errorsBySymbol, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [displayDate, setDisplayDate] = useState<string | null>(null);
  const [previousSession, setPreviousSession] = useState(false);

  useEffect(() => {
    const today = etDate();
    let cancelled = false;
    const unsubs: Array<() => void> = [];
    async function attachForDate(dateKey: string) {
      setDisplayDate(dateKey);
      setPreviousSession(dateKey !== today);

      for (const sym of symbols) {
        const ref = doc(db, `indexSeries/${dateKey}/symbols/${sym}`);
        const snap = await getDoc(ref);
        if (!cancelled && snap.exists()) {
          setSeries((prev) => ({
            ...prev,
            [sym]: (snap.data()?.series as Tick[]) ?? [],
          }));
        }

        // live updates
        const off = onSnapshot(
          ref,
          (s) => {
            if (!s.exists()) return;
            const ser = (s.data()?.series as Tick[]) ?? [];
            setSeries((prev) => ({ ...prev, [sym]: ser }));
          },
          (err) => {
            setErrors((e) => ({ ...e, [sym]: err.message }));
          }
        );
        unsubs.push(off);
      }
    }

    (async () => {
      setLoading(true);

      // Try today's trading day first
      const todayRef = doc(db, `indexSeries/${today}/symbols/${symbols[0]}`);
      const todaySnap = await getDoc(todayRef);
      if (todaySnap.exists() && isUsMarketOpen()) {
        await attachForDate(today);
      } else {
        // fallback: last available trading day
        // If today is Sunday or Saturday, go back to Friday
        const weekday = dayjs().tz(TZ).day();
        let prevday = "";
        if (weekday === 0) {
          // Sunday
          prevday = dayjs().tz(TZ).subtract(2, "day").format("YYYY-MM-DD");
        } else if (weekday === 1) {
          // Monday
          prevday = dayjs().tz(TZ).subtract(3, "day").format("YYYY-MM-DD");
        } else {
          prevday = dayjs().tz(TZ).subtract(1, "day").format("YYYY-MM-DD");
        }
        // const prevday = dayjs().tz(TZ).subtract(1, "day").format("YYYY-MM-DD");
        const q = query(
          collection(db, `indexSeries/${prevday}/symbols`),
          orderBy("date", "desc"),
          limit(1)
        );

        const qs = await getDocs(q);
        if (!qs.empty) {
          const lastDate = (qs.docs[0].data() as any).date as string;
          await attachForDate(lastDate);
        } else {
          // no data at all
          setDisplayDate(null);
          setPreviousSession(false);
        }
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [symbols.join("|")]);

  // Compute latest price + intraday % change
  const latestBySymbol = useMemo(() => {
    const latest: Record<string, { price: number; changePct: number }> = {};
    for (const sym of symbols) {
      const ser = seriesBySymbol[sym] ?? [];
      const first = ser[0];
      const last = ser[ser.length - 1];
      const price = last?.p ?? 0;
      const changePct = first && last && first.p > 0 ? ((last.p - first.p) / first.p) * 100 : 0;
      latest[sym] = { price, changePct };
    }
    return latest;
  }, [seriesBySymbol, symbols.join("|")]);

  return {
    seriesBySymbol,
    latestBySymbol,
    errorsBySymbol,
    loading,
    displayDate,
    previousSession,
  };
}
