"use client";

import React, { useState, useCallback } from "react";
import Button from "@/components/general/Button";
import Image from "next/image";
import Link from "next/link";
import { BsGoogle, BsTwitterX } from "react-icons/bs";
import AuthForm from "@/components/AuthForm";
import { signInWithPopup, GoogleAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Providers can be created once (avoid re-instantiating on each render)
const googleProvider = new GoogleAuthProvider();
const twitterProvider = new TwitterAuthProvider();

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

const SignInPage = () => {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleOauthSignin = useCallback(
    async (provider: GoogleAuthProvider | TwitterAuthProvider) => {
      try {
        setIsSigningIn(true);

        // 1) Client Firebase auth popup
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken(true); // force fresh token

        // 2) Hit server APIs (server-only code lives behind these routes)
        //    - Ensures user doc exists
        await postJSON<{ ok: true }>(`/api/auth/add-user-if-not-exists`, { idToken });
        //    - Creates/refreshes your server session (cookies, etc.)
        const signInResult = await postJSON<{ success: boolean; message?: string }>(
          `/api/auth/sign-in`,
          { idToken }
        );

        if (signInResult.success) {
          toast.success("Signed in successfully!");
          router.push("/dashboard");
        } else {
          toast.error(signInResult.message || "Error signing in, please try again.");
          setIsSigningIn(false);
        }
      } catch (err: any) {
        console.error("OAuth sign-in error:", err);
        toast.error(err?.message || "Error signing in. Please try again.");
        setIsSigningIn(false);
      }
    },
    [router]
  );

  return (
    <div className="absolute inset-0 z-2 flex flex-col items-center justify-center gap-9">
      <Image src="/stock_pulse_logo.png" alt="Stock Pulse Logo" width={200} height={200} priority />
      <div className="auth-card">
        <p className="text-xl font-semibold text-center my-4">Sign in to your account</p>
        <AuthForm show="sign-in" />

        <div className="flex items-center my-6">
          <div className="divider" />
          <span className="px-3 text-(--secondary-text-color)">Or continue with</span>
          <div className="divider" />
        </div>

        <div className="flex gap-4 my-7">
          <Button
            variant="outline"
            className="sign-in-socials"
            onClick={() => handleOauthSignin(googleProvider)}
            disabled={isSigningIn}
          >
            <BsGoogle />
            Google
          </Button>
          <Button
            variant="outline"
            className="sign-in-socials"
            onClick={() => handleOauthSignin(twitterProvider)}
            disabled={isSigningIn}
          >
            <BsTwitterX />X
          </Button>
        </div>

        <p className="text-center text-(--secondary-text-color) mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-(--accent-color) hover:brightness-125">
            Sign up
          </Link>
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/terms" className="text-(--secondary-text-color) text-sm hover:brightness-125">
          Terms
        </Link>
        <Link
          href="/privacy"
          className="text-(--secondary-text-color) text-sm hover:brightness-125"
        >
          Privacy
        </Link>
      </div>
    </div>
  );
};

export default SignInPage;
