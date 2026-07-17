"use client";

import { cn, formatPrice } from "@/lib/utils";
import { getVariantDisplayPrice } from "@/lib/products";
import type { ProductVariant, Offer } from "@prisma/client";

interface ProductSizeSelectorProps {
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (variantId: string) => void;
  offers?: Offer[];
  size?: "sm" | "lg";
  className?: string;
}

export function ProductSizeSelector({
  variants,
  selectedId,
  onSelect,
  offers = [],
  size = "lg",
  className,
}: ProductSizeSelectorProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {variants.map((variant) => {
        const isSelected = variant.id === selectedId;
        const outOfStock = variant.stock <= 0;
        const pricing = getVariantDisplayPrice({ offers }, variant);

        return (
          <button
            key={variant.id}
            type="button"
            disabled={outOfStock}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(variant.id);
            }}
            className={cn(
              "relative overflow-hidden rounded-lg border text-left transition-colors",
              size === "lg" ? "px-4 py-3" : "px-2 py-1.5",
              isSelected
                ? "border-brown bg-brown/5"
                : "border-cream-dark bg-white hover:border-brown/40",
              outOfStock && "cursor-not-allowed opacity-50"
            )}
          >
            <span
              className={cn(
                "block font-medium text-black",
                size === "lg" ? "text-sm" : "text-xs"
              )}
            >
              {variant.size}
            </span>
            <span
              className={cn(
                "block text-black/60",
                size === "lg" ? "mt-0.5 text-sm" : "text-[11px]"
              )}
            >
              {outOfStock ? "Sold out" : formatPrice(pricing.price)}
            </span>
            {outOfStock && (
              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top right, transparent calc(50% - 1px), rgba(0,0,0,0.15) 50%, transparent calc(50% + 1px))",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}