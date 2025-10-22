// import Form from "@/components/general/Form";
// import Modal from "@/components/general/Modal";
// import { auth } from "@/firebase/client";
// import { reauthenticateUser } from "@/lib/actions/auth.client.action";
// import { FormInputType } from "@/types";
// import { updatePassword } from "firebase/auth";
// import React, { useEffect, useMemo, useState } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import { toast } from "sonner";

// interface ChangePasswordModalProps {
//   open: boolean;
//   setOpen: (open: boolean) => void; // Uncomment if you want to control the modal from parent
//   onSubmit?: () => Promise<void>; // Optional: callback after successful submission
// }

// const ChangePasswordModal = ({ open, setOpen, onSubmit }: ChangePasswordModalProps) => {
//   const inputArray: FormInputType[] = useMemo(
//     () => [
//       {
//         label: "Current Password",
//         type: "password",
//         placeholder: "••••••••",
//         name: "current_password",
//         rules: {
//           required: { value: true, message: "Password is required" },
//         },
//       },
//       {
//         label: "New Password",
//         type: "password",
//         placeholder: "••••••••",
//         name: "new_password",
//         rules: {
//           required: { value: true, message: "Password is required" },
//           minLength: { value: 8, message: "Min 8 characters" },
//           maxLength: { value: 100, message: "Max 100 characters" },
//         },
//       },
//       {
//         label: "Re-type New Password",
//         type: "password",
//         placeholder: "••••••••",
//         name: "retype_password",
//         rules: {
//           required: { value: true, message: "Please retype your password" },
//           minLength: { value: 8, message: "Min 8 characters" },
//           maxLength: { value: 100, message: "Max 100 characters" },
//           custom: [
//             {
//               // note the second arg: all values from the form
//               validate: (val: string, values: Record<string, unknown>) =>
//                 val === (values["new_password"] as string),
//               message: "Passwords do not match",
//             },
//           ],
//         },
//       },
//     ],
//     [open]
//   );

//   const methods = useForm({ mode: "onChange" });
//   const { watch, trigger } = methods;
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});

//   // When new password changes, revalidate retype_password
//   const new_password = watch("new_password");
//   useEffect(() => {
//     trigger("retype_password");
//   }, [new_password, trigger]);

//   const handleSubmit = async (data: Record<string, string | {}>) => {
//     const password = data.current_password as string;
//     const email = (auth.currentUser?.email as string) || "";

//     try {
//       const result = await reauthenticateUser(email, password);
//       if (result.success) {
//         console.log("Reauthentication successful");
//         await updatePassword(auth.currentUser!, data.new_password as string);
//         console.log("Password updated successfully");
//         toast.success("Password updated successfully");
//         setOpen(false);
//       } else {
//         throw new Error(result.message || "Reauthentication failed");
//       }
//     } catch (error: any) {
//       console.error("Reauthentication error:", error);
//       if (error.message.includes("Invalid password")) {
//         console.error("Invalid password provided");
//         setFormErrors((prev) => ({ ...prev, current_password: "Invalid password" }));
//         toast.error("Invalid password. Please try again.");
//         return;
//       }
//       console.error("Reauthentication failed:", error);
//       toast.error("Reauthentication failed. Please try again.");
//     }
//   };

//   return (
//     <Modal header="Change Password" open={open} setOpen={setOpen} hideFooter>
//       <div>
//         <p className="text-(--secondary-text-color) mb-4">
//           Enter your current password and new password to change your password.
//         </p>
//         <FormProvider {...methods}>
//           <Form
//             inputsArray={inputArray}
//             submitButtonText="Change Password"
//             onSubmit={handleSubmit}
//             formErrors={formErrors}
//           />
//         </FormProvider>
//       </div>
//     </Modal>
//   );
// };

// export default ChangePasswordModal;
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/components/general/Modal";
import Form from "@/components/general/Form";
import { FormInputType } from "@/types";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

interface ChangePasswordModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit?: () => Promise<void>;
}

const ChangePasswordModal = ({ open, setOpen, onSubmit }: ChangePasswordModalProps) => {
  const inputArray: FormInputType[] = useMemo(
    () => [
      {
        label: "Current Password",
        type: "password",
        placeholder: "••••••••",
        name: "current_password",
        rules: {
          required: { value: true, message: "Password is required" },
        },
      },
      {
        label: "New Password",
        type: "password",
        placeholder: "••••••••",
        name: "new_password",
        rules: {
          required: { value: true, message: "Password is required" },
          minLength: { value: 8, message: "Min 8 characters" },
          maxLength: { value: 100, message: "Max 100 characters" },
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
              validate: (val: string, values: Record<string, unknown>) =>
                val === (values["new_password"] as string),
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
  const new_password = watch("new_password");
  useEffect(() => {
    trigger("retype_password");
  }, [new_password, trigger]);

  const handleSubmit = async (data: Record<string, string | {}>) => {
    const currentPassword = data.current_password as string;
    const newPassword = data.new_password as string;

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        toast.error("You must be signed in with an email/password account.");
        return;
      }

      // Reauthenticate with current password
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);

      // Update to the new password
      await updatePassword(user, newPassword);

      toast.success("Password updated successfully.");
      setOpen(false);
      if (onSubmit) await onSubmit();
    } catch (error: any) {
      console.error("Change password error:", error);
      const code = error?.code || "";
      const message = error?.message || "";

      if (code === "auth/wrong-password" || message.toLowerCase().includes("invalid password")) {
        setFormErrors((prev) => ({ ...prev, current_password: "Invalid password" }));
        toast.error("Invalid current password. Please try again.");
        return;
      }

      if (code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
        return;
      }

      if (code === "auth/requires-recent-login") {
        toast.error("Please sign in again and retry changing your password.");
        return;
      }

      if (code === "auth/provider-already-linked" || code === "auth/user-mismatch") {
        toast.error("This account may not use email/password. Try password reset instead.");
        return;
      }

      toast.error("Failed to update password. Please try again.");
    }
  };

  return (
    <Modal header="Change Password" open={open} setOpen={setOpen} hideFooter>
      <div>
        <p className="text-(--secondary-text-color) mb-4">
          Enter your current password and new password to change your password.
        </p>
        <FormProvider {...methods}>
          <Form
            inputsArray={inputArray}
            submitButtonText="Change Password"
            onSubmit={handleSubmit}
            formErrors={formErrors}
          />
        </FormProvider>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
