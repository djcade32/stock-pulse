import Form from "@/components/general/Form";
import Modal from "@/components/general/Modal";
import { auth } from "@/firebase/client";
import { FormInputType } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { EmailAuthProvider, linkWithCredential } from "firebase/auth";

const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ConnectEmailAndPasswordModalProps {
  open: boolean;
  setOpen: (open: boolean) => void; // Uncomment if you want to control the modal from parent
  onSubmit?: () => Promise<void>; // Optional: callback after successful submission
}

const ConnectEmailAndPasswordModal = ({
  open,
  setOpen,
  onSubmit,
}: ConnectEmailAndPasswordModalProps) => {
  const inputArray: FormInputType[] = useMemo(
    () => [
      {
        label: "Email",
        type: "email",
        placeholder: "name@company.com",
        name: "email",
        rules: {
          required: { value: true, message: "Email is required" },
          pattern: { value: email_pattern, message: "Enter a valid email" },
        },
      },
      {
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        name: "password",
        rules: {
          required: { value: true, message: "Password is required" },
        },
      },
      {
        label: "Re-type New Password",
        type: "password",
        placeholder: "••••••••",
        name: "retype_password",
        rules: {
          required: { value: true, message: "Please retype your password" },
          minLength: { value: 8, message: "Min 8 characters" },
          maxLength: { value: 100, message: "Max 100 characters" },
          custom: [
            {
              // note the second arg: all values from the form
              validate: (val: string, values: Record<string, unknown>) =>
                val === (values["password"] as string),
              message: "Passwords do not match",
            },
          ],
        },
      },
    ],
    [open]
  );

  const methods = useForm({ mode: "onChange" });
  const { watch, trigger } = methods;
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // When new password changes, revalidate retype_password
  const password = watch("password");
  useEffect(() => {
    trigger("retype_password");
  }, [password, trigger]);

  const handleSubmit = async (data: Record<string, string | {}>) => {
    const password = data.password as string;
    const email = data.email as string;

    try {
      const credential = EmailAuthProvider.credential(email, password);
      if (auth.currentUser) {
        console.log("Linking email & password to user:", auth.currentUser);
        await linkWithCredential(auth.currentUser, credential);
        console.log("Email & Password connected successfully");
        toast.success("Email & Password connected successfully");
        setOpen(false);
        return;
      }
      toast.error("No authenticated user found");
    } catch (error: any) {
      console.error("Error connecting email & password:", error);
      if (error instanceof Error && error.message.includes("email-already-in-use")) {
        setFormErrors((prev) => ({
          ...prev,
          email: "The email address is already in use by another account.",
        }));
        return;
      }
      toast.error("Failed to connect email & password. Please try again.");
      return;
    }
  };

  return (
    <Modal header="Connect Email & Password" open={open} setOpen={setOpen} hideFooter>
      <div>
        <p className="text-(--secondary-text-color) mb-4">
          Set a password to enable email & password login for your account
        </p>
        <FormProvider {...methods}>
          <Form
            inputsArray={inputArray}
            submitButtonText="Connect"
            onSubmit={handleSubmit}
            formErrors={formErrors}
          />
        </FormProvider>
      </div>
    </Modal>
  );
};

export default ConnectEmailAndPasswordModal;
