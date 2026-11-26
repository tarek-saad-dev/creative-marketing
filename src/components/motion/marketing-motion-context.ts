"use client";

import { createContext, useContext } from "react";

export const MarketingMotionContext = createContext(false);

export function useMarketingMotionPaused() {
  return useContext(MarketingMotionContext);
}
