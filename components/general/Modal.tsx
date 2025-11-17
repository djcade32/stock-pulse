import React from "react";
import { X } from "lucide-react";
import { ModalActionButtons } from "@/types";
import Button from "./Button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  header?: string;
  actionButtons?: ModalActionButtons;
  hideFooter?: boolean; // Optional: whether to show footer with action buttons
}

const Modal = ({ children, header, actionButtons, open, setOpen, hideFooter }: ModalProps) => {
  const isMobile = useIsMobile();

  if (!children) {
    return null; // Don't render the modal if there are no children
  }

  const showCancelButton = !!actionButtons?.cancel;

  const closeModal = () => {
    setOpen(false);
  };

  const onConfirm = () => {
    if (actionButtons?.confirm?.onClick) {
      actionButtons.confirm.onClick();
    } else {
      console.log("Implement confirm action");
    }
    closeModal();
  };

  return (
    <div className={cn("modal-backdrop", open ? "opacity-100 z-50" : "opacity-0 z-[-1]")}>
      <div className="modal-content">
        <div className="flex items-center justify-between border-b-2 border-(--secondary-color) p-6">
          <div className="flex flex-1">
            <h2 className="font-bold text-lg md:text-xl">{header}</h2>
          </div>
          <X
            className="text-(--gray-accent-color) hover:cursor-pointer hover:brightness-175 smooth-animation"
            onClick={closeModal}
          />
        </div>
        <div className="p-6">{children}</div>
        {!hideFooter && (
          <div className="flex items-center justify-between gap-4 border-t-2 border-(--secondary-color) p-6">
            <div>
              {!!actionButtons?.slotLeft
                ? actionButtons.slotLeft()
                : showCancelButton && (
                    <Button
                      onClick={closeModal}
                      variant={actionButtons?.cancel?.variant || "ghost"}
                      className="!text-foreground"
                    >
                      {actionButtons?.cancel?.label || "Cancel"}
                    </Button>
                  )}
            </div>
            <div className="flex justify-end gap-4 ">
              {!!actionButtons?.slotRight ? (
                <div>{actionButtons.slotRight()}</div>
              ) : (
                <Button
                  onClick={onConfirm}
                  disabled={actionButtons?.confirm?.disabled}
                  variant={actionButtons?.confirm?.variant}
                >
                  {actionButtons?.confirm?.label || "Confirm"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
