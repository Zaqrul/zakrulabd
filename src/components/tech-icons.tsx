import Image from "next/image";
import type { CSSProperties } from "react";

/* Tawk.to publishes no vector mark and has no Simple Icons entry, so its brand
   logo ships as an image here rather than as an inline SVG path like the rest. */
export function TawkToIcon({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <Image
      src="/tawkto.png"
      alt=""
      width={64}
      height={64}
      aria-hidden="true"
      className={`object-contain ${className}`}
      style={style}
    />
  );
}
