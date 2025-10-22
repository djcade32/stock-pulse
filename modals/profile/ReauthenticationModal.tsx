import Form from "@/components/general/Form";
import Modal from "@/components/general/Modal";
import { auth } from "@/firebase/client";
import { FormInputType } from "@/types";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import React from "react";
import { toast } from "sonner";

interface ReauthenticationModalProps {
  open: boolean;
  setOpen: (open: boolean) => void; // Uncomment if you want to control the modal from parent
  onSubmit?: () => Promise<void>; // Optional: callback after successful submission
}

const ReauthenticationModal = ({ open, setOpen, onSubmit }: ReauthenticationModalProps) => {
  const inputArray: FormInputType[] = [
    {
      label: "Password",
      type: "password",
      placeholder: "••••••••",
      name: "password",
      rules: {
        required: { value: true, message: "Password is required" },
        minLength: { value: 8, message: "Min 8 characters" },
        maxLength: { value: 100, message: "Max 100 characters" },
      },
    },
  ];

  const handleSubmit = async (data: Record<string, string | {}>) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("No user is currently logged in.");
      return;
    }
    const password = data.password as string;
    const email = (user.email as string) || "";

    try {
      // const result = await reauthenticateUser(email, password);
      const cred = EmailAuthProvider.credential(email, password);
      const result = await reauthenticateWithCredential(user, cred);
      if (!!result) {
        setOpen(false);
        if (onSubmit) {
          await onSubmit();
        }
      } else {
        throw new Error("Reauthentication failed");
      }
    } catch (error: any) {
      console.error("Reauthentication error:", error);
      if (error.message.includes("Invalid password")) {
        console.error("Invalid password provided");
        toast.error("Invalid password. Please try again.");
        return;
      }
      console.error("Reauthentication failed:", error);
      toast.error("Reauthentication failed. Please try again.");
    }
  };

  return (
    <Modal header="Reauthenticate" open={open} setOpen={setOpen} hideFooter>
      <div>
        <p className="text-(--secondary-text-color) mb-4">
          For your security, please reauthenticate to continue
        </p>
        <Form inputsArray={inputArray} submitButtonText="Reauthenticate" onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
};

export default ReauthenticationModal;
