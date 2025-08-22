interface User {
  name: string;
  email: string;
  id: string;
}

interface SignInParams {
  email: string;
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
