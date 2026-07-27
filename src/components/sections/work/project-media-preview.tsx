"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/components/motion/reduced-motion";
import { canUseNextImage } from "@/lib/media/public-media";

type ProjectMediaPreviewProps = {
  kind: "image" | "video";
  src: string;
  poster: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
};

/**
 * Image via next/image when possible.
 * Video: muted, playsInline, poster required, pause offscreen, no reduced-motion autoplay.
 * Only one autoplay attempt — callers should avoid mounting many simultaneous videos.
 */
export function ProjectMediaPreview({
  kind,
  src,
  poster,
  alt,
  priority = false,
  sizes,
  className,
}: ProjectMediaPreviewProps) {
  const reducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (kind !== "video" || reducedMotion) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) =>
        setInView(entry.isIntersecting && entry.intersectionRatio > 0.35),
      { threshold: [0, 0.35, 0.6] }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [kind, reducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || kind !== "video") return;

    if (reducedMotion || !inView) {
      video.pause();
      return;
    }

    void video.play().catch(() => {
      /* autoplay may be blocked — poster remains */
    });
  }, [inView, kind, reducedMotion]);

  if (kind === "video" && !reducedMotion) {
    return (
      <div ref={containerRef} className={cn("absolute inset-0", className)}>
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
          loop
          preload="none"
          poster={poster}
          aria-label={alt}
        >
          <source src={src} />
        </video>
      </div>
    );
  }

  const imageSrc = kind === "video" ? poster : src;

  if (!canUseNextImage(imageSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn(
        "object-cover transition-transform duration-500 ease-standard",
        className
      )}
    />
  );
}
