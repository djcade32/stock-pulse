import React from "react";
import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

const SignUpPage = () => {
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
        <p className="text-xl font-semibold text-center my-4">Create an account</p>
        <AuthForm show="sign-up" />
        <div>
          <p className="text-center text-(--secondary-text-color) mt-6">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-(--accent-color) hover:brightness-125">
              Sign in
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

export default SignUpPage;
