"use client";

const TALLY_URL = "https://tally.so/r/1AAPll?transparentBackground=1&utm_source=stockwisp";

export default function FeedbackPage() {
  return (
    <main className="min-h-screen flex-1 overflow-y-auto">
      <div className="mx-auto w-full flex justify-start">
        {/* <div className="mx-auto w-full max-w-3xl border border-red-600"> */}
        <iframe
          src={TALLY_URL}
          title="StockWisp Feedback"
          className="w-full"
          style={{
            height: "100vh", // or '1200px', '1400px', etc.
            // border: "none",
            background: "transparent",
          }}
        />
      </div>
    </main>
  );
}
