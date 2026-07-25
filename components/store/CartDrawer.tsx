"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/store/SafeImage";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface SitewideOffer {
  discountPct: number;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const [sitewideOffer, setSitewideOffer] = useState<SitewideOffer | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      fetch("/api/offers/sitewide")
        .then((r) => r.json())
        .then((data) => setSitewideOffer(data?.discountPct ? data : null))
        .catch(() => {});
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const subtotal = getSubtotal();
  const discount = sitewideOffer
    ? Math.round(subtotal * (sitewideOffer.discountPct / 100) * 100) / 100
    : 0;
  const total = Math.round((subtotal - discount) * 100) / 100;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-luxury"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-cream-dark p-6">
              <h2 className="font-display text-2xl">Your Cart</h2>
              <button type="button" onClick={onClose} aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <p className="text-center text-black/60">Your cart is empty</p>
              ) : (
                <ul className="space-y-6">
                  {items.map((item) => (
                    <li key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                        <SafeImage
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-body text-lg">{item.name}</h3>
                        {item.size && <p className="text-xs text-black/50">Size: {item.size}</p>}
                        <p className="text-sm text-brown">{formatPrice(item.price)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                            className="flex h-9 w-9 items-center justify-center rounded border"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                            className="flex h-9 w-9 items-center justify-center rounded border"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="ml-auto text-red-600"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-cream-dark p-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="uppercase tracking-wider">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="mb-4 flex justify-between text-sm text-green-700">
                    <span>Sitewide Discount ({sitewideOffer?.discountPct}%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="mb-6 flex justify-between border-t border-cream-dark pt-4">
                  <span className="text-sm uppercase tracking-wider font-semibold">Total</span>
                  <span className="font-body text-xl text-brown">{formatPrice(total)}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" onClick={onClose} asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/cart" onClick={onClose}>Proceed to Cart</Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}