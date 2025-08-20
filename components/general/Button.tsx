import React from "react";
import { Button as ShadecnButton } from "@/components/ui/button";

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: (e?: any) => void;
  asChild?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "default" | "danger" | "success" | "outline" | "ghost" | "link";
  className?: string;
  showLoading?: boolean;
}

const Button = ({
  children,
  asChild,
  onClick,
  type = "button",
  disabled,
  variant = "default",
  className: customClassName,
  showLoading = false,
}: ButtonProps) => {
  // Handle different button variants if needed
  const buttonVariants = {
    default: "bg-(--accent-color) text-white",
    danger: "bg-(--danger-color) text-white",
    success: "bg-(--success-color) text-white",
    outline: "border border-(--secondary-text-color) text-white bg-(--background)",
    ghost: "bg-transparent text-gray-700",
    link: "text-(--accent-color) underline",
  };
  const className = buttonVariants[variant] || buttonVariants.default;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || showLoading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <ShadecnButton
      type={type}
      disabled={disabled}
      className={`button ${
        variant === "outline" ? "hover:bg-(--secondary-color)" : "hover:brightness-125"
      } ${className} ${customClassName}`}
      asChild={asChild}
      onClick={handleClick}
    >
      {showLoading ? <div className="loading-dots" /> : children}
    </ShadecnButton>
  );
};

export default Button;
