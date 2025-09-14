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
  date: string; // filing date e.g. "Sep 10, 2025"
  ticker: string;
  name: string;
  quarter: string; // "10-Q Q2 2025" or "10-K 2024"
  insights: string;
  aiTags: { sentiment: "Positive" | "Negative" | "Neutral"; tag: string }[];
  overallSentiment: "Bullish" | "Neutral" | "Bearish";
  url: string;
};

type TickerSentiment = {
  ticker: string;
  score: number; // 0..100
  counts: { positive: number; neutral: number; negative: number };
  tags: Array<{ tag: string; sentiment: "Positive" | "Neutral" | "Negative"; count: number }>;
  summary: string;
  numOfNews: number;
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
};
