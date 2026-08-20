"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

/* A single grey block with the shared shimmer sweep. Everything else in this
   file is built out of it, so the placeholder rhythm stays identical whether it
   comes from a route transition or from an image still on the wire. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`skeleton block ${className}`} />;
}

/* Lines of text, the last one short so a block of them reads as a paragraph
   rather than a solid grey slab. */
export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <span aria-hidden className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </span>
  );
}

/* Wraps the whole placeholder so screen readers announce a load in progress
   instead of silently reading nothing. */
export function SkeletonScreen({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/* An image that keeps a shimmer in its own box until the file has actually
   decoded. `onLoad` is the real event, so the placeholder lasts exactly as long
   as the download does — no timers, no fake delay. A cached image can be
   complete before React attaches the handler, which the ref check catches. */
export function ImageWithSkeleton({
  wrapperClassName = "",
  skeletonClassName = "",
  className = "",
  alt,
  ...props
}: ImageProps & { wrapperClassName?: string; skeletonClassName?: string }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <span className={`relative ${wrapperClassName || "block"}`}>
      {!loaded && <Skeleton className={`absolute inset-0 h-full w-full ${skeletonClassName}`} />}
      <Image
        {...props}
        alt={alt}
        ref={imgRef}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  );
}
