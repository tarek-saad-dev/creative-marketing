"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMarketingMotionPaused } from "@/components/motion/marketing-motion-context";
import styles from "./section-bridge.module.css";

export function SectionBridge({ words }: { words: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useMarketingMotionPaused();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <div ref={ref} className={styles.bridge} aria-hidden="true">
      <motion.div className={styles.line} style={paused ? { x: "0%" } : { x }}>
        {words.map(word => <span key={word}>{word}<i>✳</i></span>)}
      </motion.div>
    </div>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return <motion.div className={styles.progress} style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}
