import React from "react";

interface LoaderComponentProps {
  height: string;
  width: string;
  loading: boolean;
  children?: React.ReactNode;
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  loadingClassName?: string;
  id?: string;
}

const LoaderComponent = ({
  children,
  height,
  width,
  loading = true,
  className,
  loadingClassName,
  rounded,
  id,
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
        id={id}
        className={`bg-(--gray-accent-color) animate-pulse ${rounded && getRoundedClass(rounded)} ${
          loadingClassName ? loadingClassName : ""
        }`}
        style={{ height: height, width: width }}
      />
    );
  }
  return (
    <div id={id} className={className}>
      {children}
    </div>
  );
};

export default LoaderComponent;
