"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/store/SafeImage";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCartStore } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import type { ProductWithCategory } from "@/lib/products";
import { Button } from "@/components/ui/button";

interface AddedToBagModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductWithCategory;
  variantId: string | null;
}

export function AddedToBagModal({ open, onClose, product, variantId }: AddedToBagModalProps) {
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cartItem = items.find(
    (i) => i.productId === product.id && i.variantId === variantId
  );

  if (!cartItem) return null;

  const subtotal = getSubtotal();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[70] rounded-t-3xl bg-white p-6 shadow-luxury sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            role="dialog"
            aria-label="Added to bag"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">You just added to your bag</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 p-2.5 -mr-2 text-black/60 hover:text-black rounded-full hover:bg-cream-dark/50 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex gap-4 border-b border-cream-dark pb-5">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                <SafeImage src={cartItem.imageUrl} alt={cartItem.name} fill className="object-cover" sizes="64px" />
              </div>
              <div>
                {product.category && (
                  <p className="text-xs uppercase tracking-widest text-brown">
                    {product.category.name}
                  </p>
                )}
                <h3 className="font-body text-lg leading-tight">{cartItem.name}</h3>
                {cartItem.size && (
                  <p className="mt-0.5 text-sm text-black/50">Size: {cartItem.size}</p>
                )}
                <p className="mt-1 font-medium text-brown">{formatPrice(cartItem.price)}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-body text-lg">Bag Subtotal</span>
              <span className="font-body text-lg text-brown">{formatPrice(subtotal)}</span>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button asChild size="lg">
                <Link href="/checkout" onClick={onClose}>Go to Checkout</Link>
              </Button>
              <Button variant="outline" size="lg" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}