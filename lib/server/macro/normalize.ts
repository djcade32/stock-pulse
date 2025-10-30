import { MacroEvent } from "@/types";
import crypto from "crypto";

export function eventId(e: MacroEvent): string {
  const s = `${e.source}|${e.title}|${e.date}|${e.span?.end ?? ""}`;
  return crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
}

export function eventHash(e: MacroEvent): string {
  const s = JSON.stringify({
    title: e.title,
    category: e.category,
    date: e.date,
    time: e.time,
    tz: e.tz,
    span: e.span,
    source: e.source,
  });
  return crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
}

export function finalize(events: MacroEvent[]): MacroEvent[] {
  return events.map((e) => {
    const id = eventId(e);
    const hash = eventHash(e);
    return { ...e, id, hash };
  });
}
