"use client";

import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/components/motion/reduced-motion";
import { ScrollProgress } from "@/components/motion/section-bridge";
import styles from "./aurora-marketing-main.module.css";

import { MarketingMotionContext } from "@/components/motion/marketing-motion-context";
export { useMarketingMotionPaused } from "@/components/motion/marketing-motion-context";

export function AuroraMarketingMain({ children, quiet=false }: { children: ReactNode; quiet?: boolean }) {
  const reduced = usePrefersReducedMotion();

  return (
    <MarketingMotionContext.Provider value={reduced}>
    <main id="main-content" className={styles.shell} data-paused={reduced} data-quiet={quiet}>
      {!quiet&&<ScrollProgress />}
      <div className={styles.mesh} aria-hidden="true">
        <span className={styles.violet} />
        <span className={styles.cyan} />
        <span className={styles.mint} />
        <span className={styles.veil} />
        <span className={styles.grain} />
      </div>
      {children}
    </main>
    </MarketingMotionContext.Provider>
  );
}
