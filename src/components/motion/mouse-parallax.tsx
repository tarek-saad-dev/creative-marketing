"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { useIsTouchDevice } from "@/components/motion/reduced-motion";
import { cn } from "@/lib/utils";

type MouseParallaxProps = {
  children: React.ReactNode;
  className?: string;
  strength?: number;
};

/**
 * Small desktop-only pointer parallax via Motion Values (no full tree re-render).
 */
export function MouseParallax({
  children,
  className,
  strength = 12,
}: MouseParallaxProps) {
  const reduced = useReducedMotion();
  const isTouch = useIsTouchDevice();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 120, damping: 18, mass: 0.4 });

  if (reduced || isTouch) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={{ x: springX, y: springY }}
      onMouseMove={event => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        x.set(px * strength);
        y.set(py * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
