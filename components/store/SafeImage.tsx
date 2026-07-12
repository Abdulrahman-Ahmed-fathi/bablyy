"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect fill='%23E8DDD0' width='400' height='500'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%233D1C10' font-family='serif' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E";

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function SafeImage({ alt = "", ...props }: SafeImageProps) {
  const [src, setSrc] = useState(props.src);

  useEffect(() => {
    setSrc(props.src);
  }, [props.src]);

  return (
    <Image
      {...props}
      alt={alt}
      src={src}
      onError={() => setSrc(PLACEHOLDER)}
    />
  );
}
