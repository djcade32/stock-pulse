"use client";

import SmallerScreenPage from "@/appPages/SmallerScreenPage";
import { useIsMobile } from "@/hooks/use-mobile";
import React, { useEffect, useState } from "react";

interface MobileViewProviderProps {
  children: React.ReactNode;
}

const MOBILE_SCREEN_WIDTH = 900;

const MobileViewProvider = ({ children }: MobileViewProviderProps) => {
  const isMobile = useIsMobile();

  return <div>{!isMobile ? children : <SmallerScreenPage />}</div>;
};

export default MobileViewProvider;
