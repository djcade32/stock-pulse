import React, { ReactNode } from "react";
import Button from "../general/Button";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileSettingRowProps {
  title: string;
  titleClassName?: string;
  rowClassName?: string;
  actionText: string;
  onActionClick: () => void;
  description?: string;
  descriptionClassName?: string;
  descriptionIcon?: IconType | React.ElementType | null;
  descriptionIconColor?: string;
  icon?: IconType | React.ElementType | null;
  iconVariant?: "default" | "danger" | "success" | "warning" | "ghost";
  actionButtonVariant?: "default" | "danger" | "success" | "outline" | "ghost" | "link";
  actionButtonClassName?: string;
}

const ProfileSettingRow = ({
  title,
  titleClassName,
  rowClassName,
  actionText,
  onActionClick,
  description,
  descriptionClassName,
  descriptionIcon,
  descriptionIconColor,
  icon,
  iconVariant = "default",
  actionButtonVariant = "default",
  actionButtonClassName,
}: ProfileSettingRowProps) => {
  const isMobile = useIsMobile();

  const iconsVariants = {
    default: "bg-(--accent-color)/30 text-(--accent-color)",
    danger: "bg-(--danger-color)/30 text-(--danger-color)",
    success: "bg-(--success-color)/30 text-(--success-color)",
    warning: "bg-(--warning-color)/30 text-(--warning-color)",
    ghost: "bg-(--gray-accent-color)/30 text-(--gray-accent-color)",
  };
  const iconColor = iconsVariants[iconVariant] || iconsVariants.default;
  return (
    <div
      className={cn(
        "bg-(--background) p-4 rounded-lg flex items-center justify-between",
        rowClassName,
        isMobile ? "flex-col gap-4 w-full" : ""
      )}
    >
      <div className={cn("flex items-center gap-3", isMobile && "w-full")}>
        <div className={`flex items-center justify-center p-2 rounded-lg w-10 h-10 ${iconColor}`}>
          {icon && React.createElement(icon)}
        </div>
        <div className="flex flex-col flex-1">
          <p className={cn("font-bold", titleClassName)}>{title}</p>
          {description && (
            <div className="flex items-center gap-1">
              {descriptionIcon &&
                React.createElement(descriptionIcon, {
                  className: `text-(--${descriptionIconColor})`,
                })}
              <p className={cn("text-sm text-(--secondary-text-color)", descriptionClassName)}>
                {description}
              </p>
            </div>
          )}
        </div>
      </div>
      <Button
        onClick={onActionClick}
        variant={actionButtonVariant}
        className={cn(isMobile && "w-full", actionButtonClassName)}
      >
        <p>{actionText}</p>
      </Button>
    </div>
  );
};

export default ProfileSettingRow;
