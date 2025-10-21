import { FieldValue } from "firebase-admin/firestore";

interface User {
  name: string;
  email: string;
  id: string;
}

interface SignInParams {
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

// type SignInResult = { success: true } | { success: false; message: string };
type SignInResult =
  | { success: true }
  | { success: false; code?: "ID_TOKEN_EXPIRED" | "INVALID_ID_TOKEN"; message: string };

export type FormInputType = {
  type: "text" | "email" | "password";
  placeholder?: string;
  value?: string;
  label?: string;
  name?: string;
  preIcon?: React.ReactNode;
  postIcon?: React.ReactNode;
  className?: string;
  rules?: FormRulesType;
};

type FormRulesType = {
  required?: {
    value: boolean;
    message?: string;
  };
  minLength?: {
    value: number;
    message?: string;
  };
  maxLength?: {
    value: number;
    message?: string;
  };
  pattern?: {
    value: RegExp;
    message?: string;
  };
  custom?: {
    validate: (...props) => boolean | string;
    message?: string;
  }[];
};

export interface ModalActionButtons {
  confirm?: {
    label?: string;
    onClick: () => void | Promise<void>;
    disabled?: boolean;
    variant?: "danger" | "ghost";
  };
  cancel?: {
    label?: string;
    onClick?: () => void | Promise<void>;
    variant?: "ghost" | "danger";
  };
  slotRight?: () => React.ReactNode;
  slotLeft?: () => React.ReactNode;
}

export interface Stock {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  isin: unknown;
  mic: string;
  shareClassFIGI: string;
  symbol: string;
  symbol2: string;
  type: string;
}

export type ReportRowDTO = {
  id: string;
  date: string; // filing date e.g. "Sep 10, 2025"
  ticker: string;
  name: string;
  quarter: string; // "10-Q Q2 2025" or "10-K 2024"
  insights: string;
  aiTags: AITag[];
  overallSentiment: "Bullish" | "Neutral" | "Bearish";
  url: string;
  risks?: { label: string; severity: number }[];
  kpis?: KPI[];
  bulletSummary?: SummaryBullet[]; // array of bullet points
  risk_factors?: string | null; // e.g. "Risks include supply chain disruptions, competitive pressures, and regulatory challenges in key markets."
  management_tone?: string | null; // e.g. "Management remains cautiously optimistic, emphasizing innovation and operational efficiency to navigate macro challenges."
  revenue_performance?: string | null; // e.g. "Strong iPhone 15 sales drove 2.1% revenue growth to $89.5B, exceeding analyst expectations despite macro headwinds."
};
export type KPI = {
  name: string;
  value: string;
  unit: string | null;
  yoyDelta: string | null;
  qoqDelta: string | null;
};

type TickerSentiment = {
  ticker: string;
  score: number; // 0..100
  summary: string;
  tags: AITag[];
  summary: string;
  numOfNews: number;
  updatedAt: Date;
};

type News = {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  sentiment: "Positive" | "Negative" | "Neutral";
  publishedAt: Date;
  timeElapsed: string;
  related: string[]; // related tickers
};

export type WatchlistStock = {
  description: string;
  symbol: string;
  type?: string;
  createdAt?: string;
  latestEarningsDate?: string;
};

export type AITag = {
  sentiment: SentimentLabel;
  topic: string;
};

export type WatchlistCard = {
  name: string;
  ticker: string;
  type: string;
  price: number;
  percentChange: number;
  dollarChange: string;
  sentimentScore: number;
  numOfNews: number;
  aiTags?: AITag[];
  sentimentSummary: string;
  latestEarningsDate?: string;
};

export type FilingAnalysis = {
  summary: { tldr: string; bullets: SummaryBullet[] };
  themes: { topic: string; sentiment: number }[]; // 1..10
  overallSentiment: "Bullish" | "Neutral" | "Bearish";
  kpis: {
    name: string;
    value: string;
    unit: string | null;
    yoyDelta: string | null;
    qoqDelta: string | null;
  }[];
  risks: { label: string; severity: number }[];
  flags: { guidanceChange: boolean; liquidityConcern: boolean; marginInflection: boolean };
  quarter: string; // e.g. "Q2 2024"
  revenue_performance: string | null; // e.g. "Strong iPhone 15 sales drove 2.1% revenue growth to $89.5B, exceeding analyst expectations despite macro headwinds."
  risk_factors: string | null; // e.g. "Risks include supply chain disruptions, competitive pressures, and regulatory challenges in key markets."
  management_tone: string | null; // e.g. "Management remains cautiously optimistic, emphasizing innovation and operational efficiency to navigate macro challenges."
};

export type CompareFilingsAIResult = {
  comparisonTitle: string; // e.g. "COMPANY_A (Q2 2025) vs COMPANY_B (Q1 2025)"
  aiVerdict: {
    growthEdge: string;
    stabilityEdge: string;
    overallOutlook: string;
    investmentSummary: {
      momentumInvestors: string;
      riskAverseInvestors: string;
    };
  };
};

export type SummaryBullet = {
  bullet: string;
  sentiment: SentimentLabel;
};

export type SentimentLabel =
  | "positive"
  | "neutral"
  | "negative"
  | "Positive"
  | "Negative"
  | "Neutral";

export type ArticlePred = {
  sentiment: SentimentLabel;
  sentimentScore: number;
  themes: { topic: string; sentiment: SentimentLabel }[];
  summary: { tldr: string; bullets: string[] };
};

export type StockHit = {
  symbol: string;
  description: string;
  type?: string;
};

export type PromiseResolveType = {
  message?: string;
  success: boolean;
};
