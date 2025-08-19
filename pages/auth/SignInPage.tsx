"use client";

import React from "react";
import Button from "@/components/general/Button";
import Input from "@/components/general/Input";
import Image from "next/image";
import Link from "next/link";
import { BsGoogle, BsTwitterX } from "react-icons/bs";
import { redirect } from "next/navigation";

const SignInPage = () => {
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign-in logic here
    console.log("Sign in form submitted");
    redirect("/dashboard"); // Redirect to dashboard after sign-in
  };

  return (
    <div className="absolute inset-0 z-2 flex flex-col items-center justify-center gap-9">
      <Image src={"/stock_pulse_logo.png"} alt="Stock Pulse Logo" width={200} height={200} />
      <div className="auth-card">
        <p className="text-xl font-semibold text-center my-4">Sign in to your account</p>
        <form className="flex flex-col">
          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="email" className="text-(--secondary-text-color)">
              Email
            </label>
            <Input name="email" type="email" placeholder="name@company.com" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-(--secondary-text-color)">
              Password
            </label>
            <Input name="password" type="password" placeholder="••••••••" />
          </div>
          <div className="flex justify-end mt-2">
            <Link
              href="/forgot-password"
              className="text-(--accent-color) text-sm hover:brightness-125"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="mt-6" variant="success" onClick={handleSignIn}>
            Sign in
          </Button>
        </form>

        <div className="flex items-center my-6">
          <div className="divider" />
          <span className="px-3 text-(--secondary-text-color)">Or continue with</span>
          <div className="divider" />
        </div>
        <div className="flex gap-4 my-7">
          <Button variant="outline" className="sign-in-socials">
            <BsGoogle />
            Google
          </Button>
          <Button variant="outline" className="sign-in-socials">
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
