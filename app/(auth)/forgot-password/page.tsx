import Button from "@/components/general/Button";
import Input from "@/components/general/Input";
import Image from "next/image";
import Link from "next/link";
import { BsApple, BsGoogle } from "react-icons/bs";

export default function Home() {
  return (
    <div className="absolute inset-0 z-2 flex flex-col items-center justify-center gap-9">
      <Image src={"/stock_pulse_logo.png"} alt="Stock Pulse Logo" width={200} height={200} />
      <div className="auth-card">
        <p className="text-xl font-semibold text-center my-4">Forgot Password?</p>
        <form className="flex flex-col">
          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="email" className="text-(--secondary-text-color)">
              Email
            </label>
            <Input name="email" type="email" placeholder="name@company.com" />
          </div>
          <Button type="submit" className="mt-6" variant="success">
            Reset Password
          </Button>
        </form>

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
}
