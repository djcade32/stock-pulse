import React from "react";

const SmallerScreenPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-5 bg-(--background) backdrop-blur-md">
      <p className="font-bold text-2xl mb-5 text-center">
        Oops! We’re Too Powerful for Smaller Screens
      </p>
      <p className="max-w-md text-lg text-center text-(--secondary-text-color)">
        StockWisp is built to thrive on desktop. For the best experience, hop on your computer and
        let the analysis begin!
      </p>
    </div>
  );
};

export default SmallerScreenPage;
