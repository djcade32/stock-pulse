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
