"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlistStore } from "@/lib/wishlist";

export function WishlistIcon() {
  const [mounted, setMounted] = useState(false);
  const count = useWishlistStore((s) => s.productIds.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/wishlist"
      className="relative p-2 transition-colors hover:text-brown"
      aria-label="Wishlist"
    >
      <Heart className="h-5 w-5" />
      {mounted && (
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brown text-xs text-white"
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </Link>
  );
}