// "use client";

// import React, { useEffect, useState } from "react";
// import { CircleUser } from "lucide-react";
// import Form from "./general/Form";
// import { FormInputType } from "@/types";
// import { useForm, FormProvider } from "react-hook-form";
// import { signIn, signUp } from "@/lib/actions/auth.server.action";
// import {
//   createUserWithEmailAndPassword,
//   sendEmailVerification,
//   sendPasswordResetEmail,
//   signInWithEmailAndPassword,
//   updateProfile,
// } from "firebase/auth";
// import { auth, db } from "@/firebase/client";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import Link from "next/link";
// import { doc, getDoc, setDoc } from "firebase/firestore";

// const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// interface AuthFormProps {
//   show: "sign-up" | "sign-in" | "forgot-password";
// }

// const AuthForm = ({ show }: AuthFormProps) => {
//   const router = useRouter();
//   const [inputsArray, setInputsArray] = useState<FormInputType[]>([]);

//   // Create a single RHF instance for this form and share via context
//   const methods = useForm({ mode: "onChange" });
//   const { watch, trigger } = methods;

//   // When password changes, revalidate retype_password
//   const password = watch("password");
//   useEffect(() => {
//     if (show === "sign-up") trigger("retype_password");
//   }, [password, show, trigger]);

//   useEffect(() => {
//     createInputsArray();
//     // also revalidate on view switches to keep errors in sync
//     if (show !== "sign-up") trigger();
//   }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

//   const createInputsArray = () => {
//     const inputs: FormInputType[] = [];

//     if (show === "forgot-password") {
//       inputs.push({
//         label: "Email",
//         type: "email",
//         placeholder: "name@company.com",
//         name: "email",
//         rules: {
//           required: { value: true, message: "Email is required" },
//           pattern: { value: email_pattern, message: "Enter a valid email" },
//         },
//       });
//     } else if (show === "sign-in" || show === "sign-up") {
//       inputs.push(
//         {
//           label: "Email",
//           type: "email",
//           placeholder: "name@company.com",
//           name: "email",
//           rules: {
//             required: { value: true, message: "Email is required" },
//             pattern: { value: email_pattern, message: "Enter a valid email" },
//           },
//         },
//         {
//           label: "Password",
//           type: "password",
//           placeholder: "••••••••",
//           name: "password",
//           rules: {
//             required: { value: true, message: "Password is required" },
//             minLength: { value: 8, message: "Min 8 characters" },
//             maxLength: { value: 100, message: "Max 100 characters" },
//           },
//         }
//       );

//       if (show === "sign-up") {
//         inputs.unshift({
//           label: "Name",
//           type: "text",
//           placeholder: "John Doe",
//           name: "name",
//           postIcon: <CircleUser color="var(--secondary-text-color)" />,
//           rules: {
//             required: { value: true, message: "Name is required" },
//             minLength: { value: 2, message: "Min 2 characters" },
//             maxLength: { value: 50, message: "Max 50 characters" },
//           },
//         });
//         inputs.push({
//           label: "Re-type Password",
//           type: "password",
//           placeholder: "••••••••",
//           name: "retype_password",
//           rules: {
//             required: { value: true, message: "Please retype your password" },
//             minLength: { value: 8, message: "Min 8 characters" },
//             maxLength: { value: 100, message: "Max 100 characters" },
//             custom: [
//               {
//                 // note the second arg: all values from the form
//                 validate: (val: string, values: Record<string, unknown>) =>
//                   val === (values["password"] as string),
//                 message: "Passwords do not match",
//               },
//             ],
//           },
//         });
//       }
//     }

//     setInputsArray(inputs);
//   };

//   const getSubmitButtonText = () => {
//     if (show === "sign-up") return "Sign up";
//     if (show === "sign-in") return "Sign in";
//     if (show === "forgot-password") return "Reset Password";
//     return "Submit";
//   };

//   const customSlot = (
//     <div className="flex justify-end mt-[-10px]">
//       <Link href="/forgot-password" className="text-(--accent-color) text-sm hover:brightness-125">
//         Forgot Password?
//       </Link>
//     </div>
//   );

//   const submitForm = async (data: any) => {
//     const { name, email, password } = data;
//     try {
//       if (show === "sign-in") {
//         try {
//           const cred = await signInWithEmailAndPassword(auth, email, password);
//           // Check if email is verified
//           if (!cred.user.emailVerified) {
//             toast.error("Please verify your email before signing in.");
//             sendEmailVerification(cred.user);
//             await auth.signOut();
//             return;
//           }
//           // Check if user previously changed email and need to update db record
//           const uid = cred.user.uid;
//           await getDoc(doc(db, `users/${uid}`)).then(async (docSnap) => {
//             if (docSnap.exists()) {
//               const userData = docSnap.data();
//               if (userData.email !== cred.user.email) {
//                 console.log("Updating email in Firestore to: ", cred.user.email);
//                 // Update email in Firestore
//                 await setDoc(doc(db, `users/${uid}`), { email: cred.user.email }, { merge: true });
//               }
//             }
//           });

//           // 1) Get a fresh token up front
//           let idToken = await cred.user.getIdToken(/* forceRefresh */ true);

//           // 2) Ask server to mint the session cookie
//           let result = await signIn({ idToken });

//           // 3) If server says token was expired/invalid, refresh and try once more
//           if (!result?.success && result.code === "ID_TOKEN_EXPIRED") {
//             console.log("ID token expired, refreshing...");
//             idToken = await cred.user.getIdToken(true);
//             result = await signIn({ idToken });
//           }

//           if (!result?.success) {
//             console.error("Sign in failed:", result?.message);
//             toast.error(result?.message || "Error signing in, please try again.");
//             return;
//           }

//           toast.success("Signed in successfully!");
//           router.push("/dashboard");
//         } catch (e) {
//           console.error(e);
//           toast.error("Sign in failed. Please try again.");
//           return;
//         }
//       } else if (show === "sign-up") {
//         console.log("Signing up with email:", email);
//         const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
//         await updateProfile(userCredentials.user, {
//           displayName: name,
//         });
//         await sendEmailVerification(userCredentials.user);
//         const result = await signUp({
//           uid: userCredentials.user.uid,
//           name: name,
//           email,
//           password,
//         });
//         if (!result?.success) {
//           toast.error(result?.message || "Error signing up, please try again.");
//           return;
//         }
//         toast.success("Account created successfully! Please verify email to sign in.");
//         router.push("/sign-in");
//       } else if (show === "forgot-password") {
//         try {
//           await sendPasswordResetEmail(auth, email);
//           toast.success("Password reset email sent! Please check your email.");
//           router.push("/sign-in");
//         } catch (error: any) {
//           if (error.code === "auth/user-not-found") return;
//           console.error("Error sending password reset email:", error);
//           toast.error("Error sending password reset email. Please try again.");
//         }
//       }
//     } catch (error) {
//       console.error("Error during sign up:", error);
//       if ((error as { code?: string }).code === "auth/email-already-in-use") {
//         toast.error("Email already in use. Please Sign In.");
//       } else {
//         toast.error("Error during sign up. Please try again.");
//       }
//     }
//   };

//   return (
//     <FormProvider {...methods}>
//       <Form
//         inputsArray={inputsArray}
//         submitButtonText={getSubmitButtonText()}
//         onSubmit={submitForm}
//         slot={show === "sign-in" && customSlot}
//       />
//     </FormProvider>
//   );
// };

// export default AuthForm;

"use client";

import React, { useEffect, useState } from "react";
import { CircleUser } from "lucide-react";
import Form from "./general/Form";
import { FormInputType } from "@/types";
import { useForm, FormProvider } from "react-hook-form";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { doc, getDoc, setDoc } from "firebase/firestore";

const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AuthFormProps {
  show: "sign-up" | "sign-in" | "forgot-password";
}

// ---- small helper for API calls ----
async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

const AuthForm = ({ show }: AuthFormProps) => {
  const router = useRouter();
  const [inputsArray, setInputsArray] = useState<FormInputType[]>([]);

  // Create a single RHF instance for this form and share via context
  const methods = useForm({ mode: "onChange" });
  const { watch, trigger } = methods;

  // When password changes, revalidate retype_password
  const password = watch("password");
  useEffect(() => {
    if (show === "sign-up") trigger("retype_password");
  }, [password, show, trigger]);

  useEffect(() => {
    createInputsArray();
    // also revalidate on view switches to keep errors in sync
    if (show !== "sign-up") trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

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
        const cred = await signInWithEmailAndPassword(auth, email, password);

        // Check if email is verified
        if (!cred.user.emailVerified) {
          toast.error("Please verify your email before signing in.");
          await sendEmailVerification(cred.user);
          await auth.signOut();
          return;
        }

        // If email changed, mirror latest into Firestore (client-side is fine)
        const uid = cred.user.uid;
        const existing = await getDoc(doc(db, `users/${uid}`));
        if (existing.exists()) {
          const userData = existing.data();
          if (userData.email !== cred.user.email) {
            await setDoc(doc(db, `users/${uid}`), { email: cred.user.email }, { merge: true });
          }
        }

        // Fresh token → tell server to (a) ensure user doc, (b) create cookie
        let idToken = await cred.user.getIdToken(true);

        await postJSON<{ ok: true }>("/api/auth/add-user-if-not-exists", { idToken });

        // Create Firebase session cookie on server
        try {
          await postJSON<{ success: boolean }>("/api/auth/sign-in", { idToken });
        } catch (e: any) {
          // If ID token was stale, refresh once and retry
          idToken = await cred.user.getIdToken(true);
          await postJSON<{ success: boolean }>("/api/auth/sign-in", { idToken });
        }

        toast.success("Signed in successfully!");
        router.push("/dashboard");
      } else if (show === "sign-up") {
        // Create Firebase user, set profile, send verification
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredentials.user, { displayName: name });
        await sendEmailVerification(userCredentials.user);

        // Optionally create the user doc immediately
        const idToken = await userCredentials.user.getIdToken(true);
        await postJSON<{ ok: true }>("/api/auth/add-user-if-not-exists", { idToken });

        toast.success("Account created! Please verify your email to sign in.");
        router.push("/sign-in");
      } else if (show === "forgot-password") {
        await sendPasswordResetEmail(auth, email);
        toast.success("Password reset email sent! Please check your inbox.");
        router.push("/sign-in");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const code = error?.code as string | undefined;
      if (show === "sign-up" && code === "auth/email-already-in-use") {
        toast.error("Email already in use. Please Sign In.");
      } else if (code === "auth/invalid-credential") {
        toast.error("Invalid credentials provided. Try again.");
      } else {
        toast.error(error?.message || "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <Form
        inputsArray={inputsArray}
        submitButtonText={getSubmitButtonText()}
        onSubmit={submitForm}
        slot={show === "sign-in" && customSlot}
      />
    </FormProvider>
  );
};

export default AuthForm;
