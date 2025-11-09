import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/QueryProvider";
import AnalyticsProvider from "@/providers/AnalyticsProvider";
import AuthBridge from "@/components/AuthBridge";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockWisp",
  description: "Real-Time Stock Market Insights and Analytics",
  verification: {
    google: "1y153xPlmDjtazvK50sbgOr1gZ6BJvk7ZGGc9L2vdZg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AnalyticsProvider />
        <AuthBridge />
        <QueryProvider>
          <Toaster />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
