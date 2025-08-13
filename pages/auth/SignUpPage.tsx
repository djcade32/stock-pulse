import React from "react";
import Button from "@/components/general/Button";
import Input from "@/components/general/Input";
import Image from "next/image";
import Link from "next/link";
import { CircleUser } from "lucide-react";

const SignUpPage = () => {
  return (
    <div className="absolute inset-0 z-2 flex flex-col items-center justify-center gap-9">
      <Image src={"/stock_pulse_logo.png"} alt="Stock Pulse Logo" width={200} height={200} />
      <div className="auth-card">
        <p className="text-xl font-semibold text-center my-4">Create an account</p>
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-(--secondary-text-color)">Name</label>
            <Input
              name="name"
              type="text"
              placeholder="John Doe"
              postIcon={<CircleUser color="var(--secondary-text-color)" />}
            />
          </div>
          <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2">
            <label htmlFor="retype_password" className="text-(--secondary-text-color)">
              Re-type Password
            </label>
            <Input name="retype_password" type="password" placeholder="••••••••" />
          </div>
          <Button type="submit" className="mt-7" variant="success">
            Sign up
          </Button>
        </form>

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
