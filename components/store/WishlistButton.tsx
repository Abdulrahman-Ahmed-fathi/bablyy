"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({ productId, className, size = "sm" }: WishlistButtonProps) {
  const inWishlist = useWishlistStore((s) => s.has(productId));
  const toggle = useWishlistStore((s) => s.toggle);

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const padding = size === "sm" ? "p-1.5" : "p-2.5";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={cn(
        "rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white",
        padding,
        className
      )}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={inWishlist}
    >
      <Heart
        className={cn(
          iconSize,
          inWishlist ? "fill-brown text-brown" : "text-black/60"
        )}
      />
    </button>
  );
}