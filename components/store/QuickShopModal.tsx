"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SafeImage } from "@/components/store/SafeImage";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  getDefaultVariant,
  getVariantDisplayPrice,
  type ProductWithCategory,
} from "@/lib/products";
import { ProductSizeSelector } from "@/components/store/ProductSizeSelector";
import { Button } from "@/components/ui/button";

interface QuickShopModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductWithCategory;
  onAdd: (variantId: string) => void;
}

export function QuickShopModal({ open, onClose, product, onAdd }: QuickShopModalProps) {
  const router = useRouter();
  const defaultVariant = getDefaultVariant(product);
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id || "");

  useEffect(() => {
    if (open) {
      setSelectedVariantId(defaultVariant?.id || "");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, defaultVariant?.id]);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || defaultVariant;
  const pricing = selectedVariant
    ? getVariantDisplayPrice(product, selectedVariant)
    : { price: 0, comparePrice: null, hasSale: false };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-luxury lg:hidden"
            role="dialog"
            aria-label="Quick shop"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Quick Shop</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="p-2.5 -mr-2 text-black/60 hover:text-black rounded-full hover:bg-cream-dark/50 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex gap-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                <SafeImage src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="64px" />
              </div>
              <div>
                {product.category && (
                  <p className="text-xs uppercase tracking-widest text-brown">
                    {product.category.name}
                  </p>
                )}
                <h3 className="font-body text-lg leading-tight">
                  {product.name}
                  {selectedVariant && (
                    <span className="text-black/50"> ({selectedVariant.size})</span>
                  )}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-medium text-brown">{formatPrice(pricing.price)}</span>
                  {pricing.comparePrice && (
                    <span className="text-sm text-black/40 line-through">
                      {formatPrice(pricing.comparePrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <ProductSizeSelector
                variants={product.variants}
                selectedId={selectedVariantId}
                onSelect={setSelectedVariantId}
                offers={product.offers}
                size="lg"
                className="grid-cols-3"
              />
            </div>

            <Button
              className="mt-6 w-full"
              size="lg"
              disabled={!selectedVariant || selectedVariant.stock <= 0}
              onClick={() => selectedVariant && onAdd(selectedVariant.id)}
            >
              Add to Bag
            </Button>

            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(`/products/${product.slug}`);
              }}
              className="mt-4 w-full text-center text-sm text-brown underline-offset-4 hover:underline"
            >
              View product page
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}