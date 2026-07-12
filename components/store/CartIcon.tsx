"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartIconProps {
  onClick: () => void;
}

export function CartIcon({ onClick }: CartIconProps) {
  const [mounted, setMounted] = useState(false);
  const count = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative p-2 transition-colors hover:text-brown"
      aria-label="Cart"
    >
      <ShoppingBag className="h-5 w-5" />
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
    </button>
  );
}
