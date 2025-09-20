// lib/server/quote-fanout.ts
import "dotenv/config";
import WebSocket, { WebSocketServer } from "ws";

/**
 * Tick type we fan out to clients.
 */
type FanoutTick = {
  s: string; // symbol, e.g. "AAPL" or "BINANCE:BTCUSDT"
  p: number; // last price
  t: number; // epoch milliseconds
  v?: number; // trade volume (optional)
};

// -------------------- Config --------------------
const PORT = Number(process.env.FANOUT_PORT || 8081);
const FINNHUB_KEY = process.env.FINNHUB_KEY;

if (!FINNHUB_KEY) {
  console.error("❌ FINNHUB_KEY missing. Set it in .env or export before running.");
  process.exit(1);
}

// -------------------- Server (downstream to browsers) --------------------
const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`✅ Fanout WS listening on ws://localhost:${PORT}`);
});

/**
 * Track per-client symbol subscriptions.
 */
type ClientSubscriptions = Set<string>;
const clientSubs = new WeakMap<WebSocket, ClientSubscriptions>();

/**
 * Add a lightweight heartbeat to keep connections alive and
 * clean up dead sockets proactively.
 */
const HEARTBEAT_MS = 30_000;
// Augment WebSocket instances at runtime with an "isAlive" flag.
function markAlive(this: WebSocket) {
  (this as any).isAlive = true;
}

// Start the heartbeat interval
const heartbeatInterval = setInterval(() => {
  for (const client of wss.clients) {
    const isAlive = (client as any).isAlive as boolean | undefined;
    if (isAlive === false) {
      console.warn("⚠️  terminating unresponsive client");
      client.terminate();
      continue;
    }
    // set false; expect a 'pong' to flip back to true
    (client as any).isAlive = false;
    try {
      client.ping();
    } catch {
      // ignore
    }
  }
}, HEARTBEAT_MS);

// Log server-level errors (rare, but useful)
wss.on("error", (err) => {
  console.error("❗ Fanout server error:", err);
});

// Handle new client connections
wss.on("connection", (clientSocket) => {
  console.log("👤 frontend client connected");

  // Initialize heartbeat tracking for this client
  (clientSocket as any).isAlive = true;
  clientSocket.on("pong", markAlive);

  // Initialize subscriptions
  clientSubs.set(clientSocket, new Set());

  // Log messages from client (subscribe/unsubscribe)
  clientSocket.on("message", (raw) => {
    const text = raw.toString();
    console.log("📩 client message:", text);
    try {
      const message = JSON.parse(text);
      if (message.type === "subscribe" && Array.isArray(message.symbols)) {
        const set = clientSubs.get(clientSocket) ?? new Set();
        const symbolsUpper = message.symbols.map((s: string) => String(s).toUpperCase());
        for (const sym of symbolsUpper) {
          set.add(sym);
          // Forward subscription upstream (duplicate sends are harmless; Finnhub ignores duplicates)
          upstream.send(JSON.stringify({ type: "subscribe", symbol: sym }));
        }
        clientSubs.set(clientSocket, set);
        console.log("✅ subscribed symbols for client:", Array.from(set).join(", "));
      } else if (message.type === "unsubscribe" && Array.isArray(message.symbols)) {
        const set = clientSubs.get(clientSocket);
        if (set) {
          const symbolsUpper = message.symbols.map((s: string) => String(s).toUpperCase());
          for (const sym of symbolsUpper) set.delete(sym);
          clientSubs.set(clientSocket, set);
          console.log("🚫 unsubscribed symbols for client:", symbolsUpper.join(", "));
        }
      }
    } catch {
      console.warn("⚠️  ignoring malformed client message");
    }
  });

  clientSocket.on("close", (code, reasonBuffer) => {
    const reasonText = typeof reasonBuffer?.toString === "function" ? reasonBuffer.toString() : "";
    console.log(`👋 client disconnected code=${code} reason="${reasonText}"`);
  });

  clientSocket.on("error", (err) => {
    console.error("❗ client ws error:", err);
  });
});

// Ensure heartbeat interval is cleared when server stops
wss.on("close", () => clearInterval(heartbeatInterval));

// -------------------- Upstream (Finnhub) --------------------
const upstreamUrl = `wss://ws.finnhub.io?token=${FINNHUB_KEY}`;
const upstream = new WebSocket(upstreamUrl);

upstream.on("open", () => console.log("🔌 Connected to Finnhub WS"));
upstream.on("close", (code, reason) => {
  const reasonText =
    typeof (reason as any)?.toString === "function" ? (reason as any).toString() : "";
  console.warn(`🔌 Finnhub WS closed code=${code} reason="${reasonText}"`);
});
upstream.on("error", (err) => {
  console.error("❗ Finnhub WS error:", err);
});

upstream.on("message", (raw) => {
  try {
    const parsed = JSON.parse(raw.toString());
    if (parsed.type === "trade" && Array.isArray(parsed.data)) {
      // Normalize ticks
      const ticks: FanoutTick[] = parsed.data.map((t: any) => ({
        s: t.s,
        p: t.p,
        t: t.t,
        v: t.v,
      }));

      // Optional: quick per-symbol count log (uncomment to debug traffic)
      // const counts: Record<string, number> = {};
      // for (const tick of ticks) counts[tick.s] = (counts[tick.s] ?? 0) + 1;
      // if (Object.keys(counts).length) console.log("📈 upstream ticks:", counts);

      // Broadcast only to clients who subscribed to those symbols
      for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        const subscriptions = clientSubs.get(client);
        if (!subscriptions || subscriptions.size === 0) continue;

        // Filter ticks relevant to this client
        const relevant = ticks.filter((tick) => subscriptions.has(tick.s));
        if (relevant.length > 0) {
          try {
            client.send(JSON.stringify({ type: "ticks", data: relevant }));
          } catch {
            // ignore individual client send errors
          }
        }
      }
    }
  } catch (error) {
    console.error("❗ Parse error from Finnhub:", error);
  }
});

// -------------------- Graceful Shutdown --------------------
function shutdown(signal: string) {
  console.log(`\n🛑 ${signal} received. Shutting down fanout server...`);
  try {
    clearInterval(heartbeatInterval);
    for (const client of wss.clients) {
      try {
        client.close(1001, "server shutting down");
      } catch {
        // ignore
      }
    }
    wss.close();
    try {
      upstream.close(1001, "server shutting down");
    } catch {
      // ignore
    }
  } finally {
    // Small delay to allow sockets to close cleanly
    setTimeout(() => process.exit(0), 200);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
