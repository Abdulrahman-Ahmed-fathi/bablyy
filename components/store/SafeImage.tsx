"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect fill='%23E8DDD0' width='400' height='500'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%233D1C10' font-family='serif' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 600;

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  quality?: number;
}

export function SafeImage({ alt = "", ...props }: SafeImageProps) {
  const [src, setSrc] = useState(props.src);
  const retriesRef = useRef(0);

  useEffect(() => {
    setSrc(props.src);
    retriesRef.current = 0;
  }, [props.src]);

  const isLocalUpload = props.src.startsWith("/uploads/");

  const handleError = () => {
    if (isLocalUpload && retriesRef.current < MAX_RETRIES) {
      retriesRef.current += 1;
      // Freshly uploaded files can briefly fail to load on Windows due to a
      // filesystem-flush race; retry a couple of times before falling back.
      setTimeout(() => {
        setSrc(`${props.src}?retry=${retriesRef.current}`);
      }, RETRY_DELAY_MS);
      return;
    }
    setSrc(PLACEHOLDER);
  };

  return (
    <Image
      {...props}
      alt={alt}
      src={src}
      unoptimized={isLocalUpload}
      onError={handleError}
    />
  );
}