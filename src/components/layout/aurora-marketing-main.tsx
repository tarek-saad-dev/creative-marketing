"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { usePrefersReducedMotion } from "@/components/motion/reduced-motion";
import styles from "./aurora-marketing-main.module.css";

const MarketingMotionContext = createContext(false);

export function useMarketingMotionPaused() {
  return useContext(MarketingMotionContext);
}

export function AuroraMarketingMain({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();

  return (
    <MarketingMotionContext.Provider value={paused || reduced}>
    <main id="main-content" className={styles.shell} data-paused={paused}>
      <div className={styles.mesh} aria-hidden="true">
        <span className={styles.violet} />
        <span className={styles.cyan} />
        <span className={styles.mint} />
        <span className={styles.veil} />
        <span className={styles.grain} />
      </div>
      {!reduced && (
        <button
          type="button"
          className={styles.motionToggle}
          aria-pressed={paused}
          aria-label="إيقاف الحركة الزخرفية"
          onClick={() => setPaused(value => !value)}
        >
          {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
          <span>{paused ? "تشغيل الحركة" : "إيقاف الحركة"}</span>
        </button>
      )}
      {children}
    </main>
    </MarketingMotionContext.Provider>
  );
}
