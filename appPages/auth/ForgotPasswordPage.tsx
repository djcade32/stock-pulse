"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

const ForgotPasswordPage = () => {
  return (
    <div className="absolute inset-0 z-2 flex flex-col items-center justify-center gap-9">
      <Image src={"/stock_pulse_logo.png"} alt="Stock Pulse Logo" width={200} height={200} />
      <div className="auth-card">
        <p className="text-xl font-semibold text-center my-4">Forgot Password?</p>
        <AuthForm show="forgot-password" />

        <div>
          <p className="text-center text-(--secondary-text-color) mt-6">
            Remember your password?{" "}
            <Link href="/sign-in" className="text-(--accent-color) hover:brightness-125">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
