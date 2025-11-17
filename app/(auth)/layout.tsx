import "../globals.css";
import Ticker from "@/components/Ticker";
import { isAuthenticated } from "@/lib/actions/auth.server.action";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-(--background) relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "var(--background)",
          backgroundImage: `
        linear-gradient(to right, rgba(33, 135, 254, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(33, 135, 254, 0.1) 1px, transparent 1px)
      `,
          backgroundSize: "20px 20px",
        }}
      />
      <div className="absolute inset-0 bg-white opacity-15 z-0" />
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/candlesticks.png')",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute top-4 left-0 right-0 z-10">
          <Ticker />
        </div>
      </div>
      {children}
    </div>
  );
}
