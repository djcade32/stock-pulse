import React from "react";

interface LoaderComponentProps {
  height: string;
  width: string;
  loading: boolean;
  children?: React.ReactNode;
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

const LoaderComponent = ({
  children,
  height,
  width,
  loading,
  className,
  rounded,
}: LoaderComponentProps) => {
  const getRoundedClass = (rounded: string) => {
    switch (rounded) {
      case "none":
        return "";
      case "sm":
        return "rounded-sm";
      case "md":
        return "rounded-md";
      case "lg":
        return "rounded-lg";
      case "full":
        return "rounded-full";
      default:
        return "";
    }
  };
  if (loading) {
    return (
      <div
        className={`bg-(--gray-accent-color) animate-pulse ${rounded && getRoundedClass(rounded)}`}
        style={{ height: height, width: width }}
      />
    );
  }
  return <div className={className}>{children}</div>;
};

export default LoaderComponent;
