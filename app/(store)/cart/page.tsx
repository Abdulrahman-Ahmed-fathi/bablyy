"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SafeImage } from "@/components/store/SafeImage";
import { useCartStore } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SitewideOffer {
  discountPct: number;
  title: string;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const [validated, setValidated] = useState(false);
  const [sitewideOffer, setSitewideOffer] = useState<SitewideOffer | null>(null);

  useEffect(() => {
    fetch("/api/offers/sitewide")
      .then((r) => r.json())
      .then((data) => setSitewideOffer(data?.discountPct ? data : null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function validate() {
      if (items.length === 0) {
        setValidated(true);
        return;
      }
      const res = await fetch("/api/products");
      if (!res.ok) {
        setValidated(true);
        return;
      }
      const products = await res.json();
      const invalid = items.filter(
        (item) => !products.find((p: { id: string; isActive: boolean }) => p.id === item.productId && p.isActive)
      );
      if (invalid.length > 0) {
        invalid.forEach((i) => removeItem(i.productId, i.variantId));
        toast.error("Some items are no longer available and were removed from your cart.");
      }
      setValidated(true);
    }
    validate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const subtotal = getSubtotal();
  const discount = sitewideOffer
    ? Math.round(subtotal * (sitewideOffer.discountPct / 100) * 100) / 100
    : 0;
  const total = Math.round((subtotal - discount) * 100) / 100;

  if (!validated) {
    return (
      <div className="mx-auto max-w-container px-4 py-12 lg:px-8">
        <div className="mb-8 h-8 w-48 skeleton" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 skeleton" />
            ))}
          </div>
          <div className="h-64 skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-12 lg:px-8">
      <h1 className="mb-12 font-display text-4xl md:text-5xl">Your Cart</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-black/60">Your cart is empty.</p>
          <Button className="mt-6" asChild>
            <Link href="/products">Browse Perfumes</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.variantId}`}
                  layout
                  exit={{ opacity: 0, x: -50 }}
                  className="flex gap-6 border-b border-cream-dark pb-6"
                >
                  <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-body text-xl hover:text-brown"
                      >
                        {item.name}
                      </Link>
                      {item.size && (
                        <p className="text-xs text-black/50">Size: {item.size}</p>
                      )}
                      <p className="mt-1 text-brown">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-cream-dark">
                        <button
                          className="px-2 py-1"
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          className="px-2 py-1"
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-body">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-red-600"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div>
            <Card className="sticky top-24 rounded-2xl shadow-luxury-sm">
              <CardContent className="p-6">
                <h2 className="font-body text-xl">Order Summary</h2>
                <div className="mt-4 flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="mt-2 flex justify-between text-sm text-green-700">
                    <span>Sitewide Discount ({sitewideOffer?.discountPct}%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="mt-4 flex justify-between border-t border-cream-dark pt-4 font-body text-xl">
                  <span>Total</span>
                  <span className="text-brown">{formatPrice(total)}</span>
                </div>
                <Button className="mt-6 w-full" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button variant="outline" className="mt-3 w-full" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}