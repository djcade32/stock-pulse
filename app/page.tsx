"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChartLine,
  Sparkles,
  Brain,
  ShieldCheck,
  Gauge,
  Layers,
  BotMessageSquare,
  GitCompareArrows,
  Search,
  ArrowRight,
  CheckCircle2,
  Github,
} from "lucide-react";
import WatchlistCardPreview from "@/components/WatchlistCardPreview";
import { ReportRowDTO, WatchlistCard } from "@/types";
import EarningsRowPreview from "@/components/EarningsRowPreview";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    gtag?: (command: string, id: string, config: { page_path: string }) => void;
  }
}

type WatchlistCardPreview = WatchlistCard & {
  logoUrl: string;
};

const WATCHLIST_DATA: WatchlistCardPreview[] = [
  {
    name: "ADVANCED MICRO DEVICES",
    logoUrl: "/amd_logo.jpeg",
    ticker: "AMD",
    type: "Common Stock",
    price: 233.76,
    percentChange: 1.53,
    dollarChange: "$3.53",
    sentimentScore: 75,
    numOfNews: 66,
    sentimentSummary:
      "AMD is viewed positively due to strong AI-related partnerships, especially with OpenAI, expected earnings growth, and increasing demand for AI chips, despite some competitive pressures and market caution.",
    aiTags: [
      {
        sentiment: "positive",
        topic: "AI Partnerships",
      },
      {
        sentiment: "positive",
        topic: "OpenAI Deal",
      },
      {
        sentiment: "positive",
        topic: "Earnings Growth",
      },
      {
        sentiment: "positive",
        topic: "Chip Demand",
      },
      {
        sentiment: "neutral",
        topic: "Market Competition",
      },
    ],
  },
  {
    name: "NVIDIA CORPORATION",
    logoUrl: "/nvda_logo.jpeg",
    ticker: "NVDA",
    type: "Common Stock",
    price: 469.23,
    percentChange: 2.34,
    dollarChange: "$10.72",
    sentimentScore: 82,
    numOfNews: 82,
    sentimentSummary:
      "NVIDIA is receiving positive sentiment due to its strong earnings report, leadership in AI technology, and strategic partnerships, despite some concerns about market competition and regulatory scrutiny.",
    aiTags: [
      {
        sentiment: "positive",
        topic: "Earnings Report",
      },
      {
        sentiment: "positive",
        topic: "Strategic Partnerships",
      },
      {
        sentiment: "neutral",
        topic: "Market Competition",
      },
      {
        sentiment: "neutral",
        topic: "Regulatory Scrutiny",
      },
    ],
  },
];

type ReportRowDTOPreview = ReportRowDTO & {
  logoUrl: string;
};

const EARNINGS_DATA: ReportRowDTOPreview[] = [
  {
    id: "TSLA-8025045968",
    date: "Oct 23, 2025",
    ticker: "TSLA",
    logoUrl: "/tsla_logo.jpeg",
    name: "TSLA",
    quarter: "10-Q Q3 2025",
    insights:
      "Tesla reported Q3 2025 revenues of $28.10B, up 12% YoY, driven by automotive sales growth and strong energy generation and storage segment performance. Net income attributable to common stockholders was $1.37B, down YoY due to lower regulatory credits and higher expenses. The company continues to invest heavily in AI... ",
    aiTags: [
      {
        topic: "Revenue Growth",
        sentiment: "Positive",
      },
      {
        topic: "Gross Margin Pressure",
        sentiment: "Neutral",
      },

      {
        topic: "Liquidity and Cash Position",
        sentiment: "Positive",
      },
      {
        topic: "Legal Risks",
        sentiment: "Negative",
      },
    ],
    overallSentiment: "Neutral",
    url: "https://www.sec.gov/Archives/edgar/data/1318605/000162828025045968/tsla-20250930.htm",
    risks: [],
    kpis: [],
    bulletSummary: [],
    risk_factors: "",
  },
  {
    id: "AAPL-8025045968",
    date: "Jun 11, 2025",
    ticker: "AAPL",
    name: "AAPL",
    logoUrl: "/aapl_logo.jpeg",
    quarter: "10-Q Q2 2025",
    insights:
      "Apple reported Q2 2025 revenues of $94.68B, up 8% YoY, driven by strong iPhone sales and growth in services and wearables segments. Net income was $25.01B, reflecting a 6% YoY increase, supported by operational efficiencies and a favorable product mix. The company is focusing on innovation in AI and AR technologies to drive future growth...",
    aiTags: [
      {
        topic: "Revenue Growth",
        sentiment: "Positive",
      },
      {
        topic: "Net Income Increase",
        sentiment: "Positive",
      },
      {
        topic: "Product Innovation",
        sentiment: "Positive",
      },
      {
        topic: "Market Competition",
        sentiment: "Neutral",
      },
    ],
    overallSentiment: "Neutral",
    url: "https://www.sec.gov/Archives/edgar/data/1318605/000162828025045968/tsla-20250930.htm",
    risks: [],
    kpis: [],
    bulletSummary: [],
    risk_factors: "",
  },
];

const gradient =
  "bg-[radial-gradient(60%_60%_at_50%_0%,rgba(33,135,254,0.35)_0%,rgba(33,135,254,0.08)_40%,rgba(14,17,22,0)_70%)]"; // accent tint

const Section = ({
  children,
  id,
  className = "",
}: React.PropsWithChildren<{ id: string; className?: string }>) => (
  <section id={id} className={`relative ${className}`}>
    {children}
  </section>
);

const Container = ({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

const Pill = ({ children }: React.PropsWithChildren) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
    {children}
  </span>
);

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<any>;
  title: string;
  desc: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5 }}
    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 hover:shadow-lg hover:shadow-[#2187fe]/10"
  >
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2187fe]/10">
      <Icon className="h-6 w-6 text-[#2187fe]" />
    </div>
    <h3 className="text-base font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm text-white/70 leading-relaxed">{desc}</p>
    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#2187fe]/10 blur-2xl transition-opacity group-hover:opacity-70" />
  </motion.div>
);

const Step = ({ n, title, desc }: { n: number; title: string; desc: string }) => (
  <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2187fe]/20 text-sm font-semibold text-[#9ec9ff]">
      {n}
    </div>
    <div>
      <h4 className="font-semibold text-white">{title}</h4>
      <p className="mt-1 text-sm text-white/70 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default function StockPulseLanding() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-J2YND7L37W", {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return (
    <div className={`relative min-h-screen bg-[#0e1116] text-white ${gradient}`}>
      <GoogleAnalytics trackPageViews gaMeasurementId="G-K72F44DGY4" />

      {/* Glow accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-10%] h-72 w-72 -translate-x-1/2 rounded-full bg-[#2187fe]/20 blur-[120px]" />
        <div className="absolute right-[10%] top-[30%] h-48 w-48 rounded-full bg-[#2187fe]/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0e1116]/80 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <a href="#home" className="flex items-center gap-2">
            <ChartLine className="h-6 w-6 text-[#2187fe]" />
            <span className="text-lg font-bold tracking-wide">StockPulse</span>
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-white/70 hover:text-white">
              Features
            </a>
            <a href="#how" className="text-sm text-white/70 hover:text-white">
              How it works
            </a>
            <a href="#faq" className="text-sm text-white/70 hover:text-white">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              Open app <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <Section className="pt-16" id="home">
        <Container className="grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
          <div>
            <Pill>
              <Sparkles className="h-3.5 w-3.5 text-[#2187fe]" />
              Free right now — jump in
            </Pill>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Understand filings. Feel the market’s <span className="text-[#2187fe]">pulse</span>.
            </motion.h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
              Stock Pulse analyzes 10‑Q filings and market news to surface clean, actionable
              signals:
              <span className="text-white"> Bullish</span>,{" "}
              <span className="text-white">Bearish</span>, or{" "}
              <span className="text-white">Neutral</span>. Build watchlists, compare companies
              side‑by‑side, and cut through the noise.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
              >
                Launch Dashboard <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Explore Features
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#2187fe]" />
                No ads
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-[#2187fe]" />
                Fast insights
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#2187fe]" />
                Focused UI
              </div>
            </div>
          </div>

          {/* Hero image placeholder — replace src with your image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-[#2187fe]/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
              <img
                src="/stock_pulse_hero.png"
                alt="Stock Pulse dashboard screenshot"
                className="block h-auto w-full"
              />
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* Feature highlights */}
      <Section id="features" className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Signals that actually help you decide
            </h2>
            <p className="mt-3 text-base text-white/70">
              Inspired by crisp, developer‑grade UX, tailored for investors.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Brain}
              title="AI filing analysis"
              desc="Parse 10‑Q language to quantify tone and risk. Summaries you can read in seconds, not hours."
            />
            <FeatureCard
              icon={BotMessageSquare}
              title="Sentiment at a glance"
              desc="Every stock gets a Bullish / Bearish / Neutral label with a confidence score and key drivers."
            />
            <FeatureCard
              icon={GitCompareArrows}
              title="AI Comparison Mode"
              desc="Compare filings side‑by‑side—highlighting tone shifts, guidance changes, and risk wording."
            />
            <FeatureCard
              icon={Search}
              title="Watchlists & quick look"
              desc="Track your symbols and jump to distilled stats, news, and upcoming earnings in one click."
            />
            <FeatureCard
              icon={ChartLine}
              title="Market context"
              desc="Blend filing tone with recent headlines to understand what’s moving sentiment today."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Privacy‑respecting"
              desc="No ads and minimal tracking. Your research stays yours."
            />
          </div>

          {/* Steps + GUI preview */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Step
                n={1}
                title="Add tickers"
                desc="Create a watchlist or paste a few symbols to start (e.g., NVDA, AMD, MU)."
              />
              <Step
                n={2}
                title="Run analysis"
                desc="We process 10‑Qs and curated news, then compute a sentiment score and label."
              />
              <Step
                n={3}
                title="Act with clarity"
                desc="Skim the summary, dive deeper on highlights, or compare companies side‑by‑side."
              />
              <div className="pt-2 text-xs text-white/50">Real‑time pricing may be delayed 30s</div>
            </div>
            <div className="space-y-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 text-sm font-semibold text-white/90">Earnings analysis</div>

                {EARNINGS_DATA.map((report) => (
                  <EarningsRowPreview key={report.id} earnings={report} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section id="how" className="py-16">
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold">Simple flow, serious depth</h3>
              <p className="mt-3 text-white/70">
                Select a company. We parse the latest 10‑Q and relevant news. Our models score tone
                and extract key factors, then present a clean summary with citations so you can
                verify.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Filing tone & risk deltas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Headline‑weighted sentiment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Confidence score with
                  drivers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Comparison Mode for A/B
                  companies
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/watchlist"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Try it now <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1319] p-5">
                <div className="mb-4 text-xs text-white/60">Sentiment card</div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {WATCHLIST_DATA.map((stock) => (
                    <WatchlistCardPreview key={stock.ticker} stock={stock} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-bold">Frequently asked</h3>
            <p className="mt-3 text-white/70">Short, honest answers.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4">
            <details className="group rounded-xl border border-white/10 bg-white/5 p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left font-medium text-white/90">
                Is Stock Pulse free?
                <span className="ml-4 text-white/50 group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-3 text-sm text-white/70">
                Yes. Stock Pulse is currently free for everyone while we iterate. Real‑time prices
                may be delayed on free data tiers.
              </p>
            </details>
            <details className="group rounded-xl border border-white/10 bg-white/5 p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left font-medium text-white/90">
                Do you analyze earnings calls?
                <span className="ml-4 text-white/50 group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-3 text-sm text-white/70">
                Right now we focus on 10‑Q filings and curated headlines. Earnings‑call analysis is
                on our roadmap.
              </p>
            </details>
            <details className="group rounded-xl border border-white/10 bg-white/5 p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left font-medium text-white/90">
                Do you track institutional holdings?
                <span className="ml-4 text-white/50 group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-3 text-sm text-white/70">
                Institutional ownership dashboards require paid data sources. For now, we prioritize
                filing tone, sentiment, and news context.
              </p>
            </details>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section id="cta" className="pb-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 text-center sm:p-12">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2187fe]/20 blur-2xl" />
            <h3 className="text-2xl font-bold">Research faster. Decide smarter.</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
              Plug in your tickers and see where the tone is heading. No credit card. No waitlist.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                Open Stock Pulse <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/djcade32/stock-pulse"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Github className="h-4 w-4" /> Star the project
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-sm text-white/60">
        <Container className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>© {new Date().getFullYear()} Stock Pulse. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-white">
              Privacy
            </a>
            <a href="/terms" className="hover:text-white">
              Terms
            </a>
            <a href="mailto:support@stockpulse.com" className="hover:text-white">
              Contact
            </a>
          </div>
        </Container>
      </footer>
    </div>
  );
}
