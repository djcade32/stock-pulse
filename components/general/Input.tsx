"use client";

import { Eye, Mail, EyeOff } from "lucide-react";
import React, { useState } from "react";

interface InputProps {
  ref?: React.Ref<HTMLInputElement>;
  name?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  preIcon?: React.ReactNode;
  postIcon?: React.ReactNode;
  className?: string;
}

const Input = ({
  ref,
  type,
  placeholder,
  value,
  onChange,
  postIcon,
  name,
  className,
  preIcon,
}: InputProps) => {
  const addExtraRightPadding = type === "email" || type === "password";
  const addExtraLeftPadding = !!preIcon;
  const [showPassword, setShowPassword] = useState(false);

  const getPostIcon = () => {
    const color = "var(--secondary-text-color)";
    if (postIcon) return postIcon;
    if (type === "email") {
      return <Mail color={color} />;
    }
    if (type === "password") {
      return showPassword ? (
        <EyeOff color={color} onClick={togglePasswordVisibility} className="cursor-pointer" />
      ) : (
        <Eye color={color} onClick={togglePasswordVisibility} className="cursor-pointer" />
      );
    }
    return null; // Default case if no postIcon is provided
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-3">{preIcon && preIcon}</div>
      <input
        type={showPassword ? "text" : type}
        placeholder={placeholder || "Enter text..."}
        className={`input ${addExtraRightPadding && "pr-10"} ${
          addExtraLeftPadding && "pl-12"
        } ${className}`}
        value={value}
        onChange={onChange}
        data-rr-is-password={type === "password" ? "true" : "false"}
        name={name}
        ref={ref}
      />
      <div className="absolute right-3">{postIcon ? postIcon : getPostIcon()}</div>
    </div>
  );
};

export default Input;
