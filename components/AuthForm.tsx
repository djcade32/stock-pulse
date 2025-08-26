"use client";

import React, { useEffect, useState } from "react";
import { CircleUser } from "lucide-react";
import Form from "./general/Form";
import { FormInputType } from "@/types";
import { useForm, FormProvider } from "react-hook-form";
import { signIn, signUp } from "@/lib/actions/auth.server.action";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AuthFormProps {
  show: "sign-up" | "sign-in" | "forgot-password";
}

const AuthForm = ({ show }: AuthFormProps) => {
  const router = useRouter();
  const [inputsArray, setInputsArray] = useState<FormInputType[]>([]);

  // Create a single RHF instance for this form and share via context
  const methods = useForm({ mode: "onChange" });
  const { getValues, watch, trigger, handleSubmit } = methods;

  // When password changes, revalidate retype_password
  const password = watch("password");
  useEffect(() => {
    if (show === "sign-up") trigger("retype_password");
  }, [password, show, trigger]);

  useEffect(() => {
    createInputsArray();
    // also revalidate on view switches to keep errors in sync
    if (show !== "sign-up") trigger();
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  const createInputsArray = () => {
    const inputs: FormInputType[] = [];

    if (show === "forgot-password") {
      inputs.push({
        label: "Email",
        type: "email",
        placeholder: "name@company.com",
        name: "email",
        rules: {
          required: { value: true, message: "Email is required" },
          pattern: { value: email_pattern, message: "Enter a valid email" },
        },
      });
    } else if (show === "sign-in" || show === "sign-up") {
      inputs.push(
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
            minLength: { value: 8, message: "Min 8 characters" },
            maxLength: { value: 100, message: "Max 100 characters" },
          },
        }
      );

      if (show === "sign-up") {
        inputs.unshift({
          label: "Name",
          type: "text",
          placeholder: "John Doe",
          name: "name",
          postIcon: <CircleUser color="var(--secondary-text-color)" />,
          rules: {
            required: { value: true, message: "Name is required" },
            minLength: { value: 2, message: "Min 2 characters" },
            maxLength: { value: 50, message: "Max 50 characters" },
          },
        });
        inputs.push({
          label: "Re-type Password",
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
        });
      }
    }

    setInputsArray(inputs);
  };

  const getSubmitButtonText = () => {
    if (show === "sign-up") return "Sign up";
    if (show === "sign-in") return "Sign in";
    if (show === "forgot-password") return "Reset Password";
    return "Submit";
  };

  const customSlot = (
    <div className="flex justify-end mt-[-10px]">
      <Link href="/forgot-password" className="text-(--accent-color) text-sm hover:brightness-125">
        Forgot Password?
      </Link>
    </div>
  );

  const submitForm = async (data: any) => {
    const { name, email, password } = data;
    try {
      if (show === "sign-in") {
        try {
          console.log("Signing in with email:", email);
          const cred = await signInWithEmailAndPassword(auth, email, password);

          // 1) Get a fresh token up front
          let idToken = await cred.user.getIdToken(/* forceRefresh */ true);

          // 2) Ask server to mint the session cookie
          let result = await signIn({ idToken });

          // 3) If server says token was expired/invalid, refresh and try once more
          if (!result?.success && result.code === "ID_TOKEN_EXPIRED") {
            console.log("ID token expired, refreshing...");
            idToken = await cred.user.getIdToken(true);
            result = await signIn({ idToken });
          }

          if (!result?.success) {
            console.error("Sign in failed:", result?.message);
            toast.error(result?.message || "Error signing in, please try again.");
            return;
          }

          toast.success("Signed in successfully!");
          router.push("/dashboard");
        } catch (e) {
          console.error(e);
          toast.error("Sign in failed. Please try again.");
        }
      } else if (show === "sign-up") {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email,
          password,
        });
        if (!result?.success) {
          toast.error(result?.message || "Error signing up, please try again.");
          return;
        }
        toast.success("Account created successfully! Please sign in.");
        router.push("/sign-in");
      } else if (show === "forgot-password") {
        try {
          await sendPasswordResetEmail(auth, email);
          toast.success("Password reset email sent! Please check your email.");
          router.push("/sign-in");
        } catch (error: any) {
          if (error.code === "auth/user-not-found") return;
          console.error("Error sending password reset email:", error);
          toast.error("Error sending password reset email. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error during sign up:", error);
      // Handle error appropriately, e.g., show a notification
    }
  };

  return (
    <FormProvider {...methods}>
      <Form
        inputsArray={inputsArray}
        submitButtonText={getSubmitButtonText()}
        onSubmit={async (data) => await submitForm(data)}
        slot={show === "sign-in" && customSlot}
      />
    </FormProvider>
  );
};

export default AuthForm;
