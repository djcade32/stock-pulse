"use client";

import { Eye, Mail, EyeOff } from "lucide-react";
import React, { useState } from "react";

interface InputProps {
  name?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  postIcon?: React.ReactNode;
}

const Input = ({ type, placeholder, value, onChange, postIcon, name }: InputProps) => {
  const addExtraRightPadding = type === "email" || type === "password";
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
    <div className="relative flex items-center">
      <input
        type={showPassword ? "text" : type}
        placeholder={placeholder || "Enter text..."}
        className={`input ${addExtraRightPadding && "pr-10"}`}
        value={value}
        onChange={onChange}
        data-rr-is-password={type === "password" ? "true" : "false"}
        name={name}
      />
      <div className="absolute right-3">{postIcon ? postIcon : getPostIcon()}</div>
    </div>
  );
};

export default Input;
