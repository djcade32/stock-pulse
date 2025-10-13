import Modal from "@/components/general/Modal";
import { ModalActionButtons } from "@/types";
import React from "react";

interface ConfirmationModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: "danger" | "ghost";
  cancelText?: string;
  cancelVariant?: "danger" | "ghost";
}

const ConfirmationModal = ({
  open,
  setOpen,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant,
  cancelVariant,
}: ConfirmationModalProps) => {
  const modalActionButtons: ModalActionButtons = {
    confirm: {
      label: confirmText,
      onClick: onConfirm,
      variant: confirmVariant,
    },
    cancel: { label: cancelText, variant: cancelVariant },
  };
  return (
    <Modal header={title} open={open} setOpen={setOpen} actionButtons={modalActionButtons}>
      <div>
        <p className="text-(--secondary-text-color) mb-4">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
