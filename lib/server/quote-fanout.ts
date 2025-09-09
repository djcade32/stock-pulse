// lib/server/quote-fanout.ts
import "dotenv/config";
import WebSocket, { WebSocketServer } from "ws";

type FanoutTick = {
  s: string; // symbol, e.g. "AAPL"
  p: number; // last price
  t: number; // epoch milliseconds
  v?: number; // trade volume (optional)
};

// config
const PORT = Number(process.env.FANOUT_PORT || 8081);
const FINNHUB_KEY = process.env.FINNHUB_KEY;
if (!FINNHUB_KEY) {
  console.error("❌ FINNHUB_KEY missing. Set it in .env or export before running.");
  process.exit(1);
}

// create WebSocket server for your frontend
const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`✅ Fanout WS listening on ws://localhost:${PORT}`);
});

// track which frontend clients are subscribed to which symbols
type ClientSubscriptions = Set<string>;
const clientSubs = new WeakMap<WebSocket, ClientSubscriptions>();

// connect upstream to Finnhub
const upstreamUrl = `wss://ws.finnhub.io?token=${FINNHUB_KEY}`;
const upstream = new WebSocket(upstreamUrl);

upstream.on("open", () => console.log("🔌 Connected to Finnhub WS"));
upstream.on("message", (msg) => {
  console.log("Message from Finnhub:", msg.toString());
  try {
    const parsed = JSON.parse(msg.toString());
    if (parsed.type === "trade" && Array.isArray(parsed.data)) {
      const ticks: FanoutTick[] = parsed.data.map((t: FanoutTick) => ({
        s: t.s,
        p: t.p,
        t: t.t,
        v: t.v,
      }));

      // broadcast only to clients that care about those symbols
      for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        const subs = clientSubs.get(client);
        if (!subs) continue;
        const relevant = ticks.filter((tick) => subs.has(tick.s));
        if (relevant.length > 0) {
          client.send(JSON.stringify({ type: "ticks", data: relevant }));
        }
      }
    }
  } catch (e) {
    console.error("Parse error from Finnhub:", e);
  }
});

// handle new client connections
wss.on("connection", (ws) => {
  console.log("👤 frontend client connected");
  clientSubs.set(ws, new Set());

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "subscribe" && Array.isArray(msg.symbols)) {
        const set = clientSubs.get(ws) ?? new Set();
        for (const sym of msg.symbols.map((s: string) => s.toUpperCase())) {
          set.add(sym);
          // also subscribe upstream to Finnhub if needed
          upstream.send(JSON.stringify({ type: "subscribe", symbol: sym }));
        }
        clientSubs.set(ws, set);
      }
      if (msg.type === "unsubscribe" && Array.isArray(msg.symbols)) {
        const set = clientSubs.get(ws);
        if (set) {
          for (const sym of msg.symbols.map((s: string) => s.toUpperCase())) {
            set.delete(sym);
          }
        }
      }
    } catch {
      /* ignore bad messages */
    }
  });

  ws.on("close", () => {
    console.log("👋 client disconnected");
  });
});
