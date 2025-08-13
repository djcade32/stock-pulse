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
}

const Button = ({
  children,
  asChild,
  onClick,
  type = "button",
  disabled,
  variant = "default",
  className: customClassName,
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

  return (
    <ShadecnButton
      type={type}
      disabled={disabled}
      className={`button ${
        variant === "outline" ? "hover:bg-(--secondary-color)" : "hover:brightness-125"
      } ${className} ${customClassName}`}
      asChild={asChild}
      onClick={onClick}
    >
      {children}
    </ShadecnButton>
  );
};

export default Button;
