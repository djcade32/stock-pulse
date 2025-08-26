"use client";

import React, { useState } from "react";
import Button from "@/components/general/Button";
import Image from "next/image";
import Link from "next/link";
import { BsGoogle, BsTwitterX } from "react-icons/bs";
import AuthForm from "@/components/AuthForm";
import { signInWithPopup, GoogleAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { auth } from "@/firebase/client";
import { addUserToDBIfNotExists, signIn } from "@/lib/actions/auth.server.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SignInPage = () => {
  const router = useRouter();
  const googleProvider = new GoogleAuthProvider();
  const twitterProvider = new TwitterAuthProvider();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleOauthSignin = async (provider: any) => {
    try {
      setIsSigningIn(true);
      const result = await signInWithPopup(auth, provider);

      const idToken = await result.user.getIdToken(true); // force fresh
      await addUserToDBIfNotExists(idToken);
      const signInResult = await signIn({ idToken });

      if (signInResult.success) {
        router.push("/dashboard");
        toast.success("Signed in successfully!");
      } else {
        console.error("Server sign-in failed:", signInResult);
        toast.error(signInResult.message || "Error signing in, please try again.");
        setIsSigningIn(false);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Error signing in with Google. Please try again.");
      setIsSigningIn(false);
    }
  };

  return (
    <div className="absolute inset-0 z-2 flex flex-col items-center justify-center gap-9">
      <Image
        src={"/stock_pulse_logo.png"}
        alt="Stock Pulse Logo"
        width={200}
        height={200}
        priority
      />
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
            onClick={async () => handleOauthSignin(googleProvider)}
            disabled={isSigningIn}
          >
            <BsGoogle />
            Google
          </Button>
          <Button
            variant="outline"
            className="sign-in-socials"
            onClick={async () => handleOauthSignin(twitterProvider)}
            disabled={isSigningIn}
          >
            <BsTwitterX />X
          </Button>
        </div>
        <div>
          <p className="text-center text-(--secondary-text-color) mt-6">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-(--accent-color) hover:brightness-125">
              Sign up
            </Link>
          </p>
        </div>
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
