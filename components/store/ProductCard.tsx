"use client";

import { useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/store/SafeImage";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Crown, Sparkles, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart";
import { formatPrice, parseFragranceNotes } from "@/lib/utils";
import {
  getDefaultVariant,
  getProductDisplayPrice,
  getVariantDisplayPrice,
  type ProductWithCategory,
} from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/store/WishlistButton";
import { ProductSizeSelector } from "@/components/store/ProductSizeSelector";
import { QuickShopModal } from "@/components/store/QuickShopModal";
import { AddedToBagModal } from "@/components/store/AddedToBagModal";

interface ProductCardProps {
  product: ProductWithCategory;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const defaultVariant = getDefaultVariant(product);
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id || "");
  const [quickShopOpen, setQuickShopOpen] = useState(false);
  const [addedOpen, setAddedOpen] = useState(false);
  const [lastAddedVariantId, setLastAddedVariantId] = useState<string | null>(null);

  if (!defaultVariant) return null;

  const pricing = getProductDisplayPrice(product);
  const notes = parseFragranceNotes(product.notes);
  const topNote = notes.top[0];
  const hasMultipleSizes = product.variants.length > 1;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const outOfStock = totalStock <= 0;

  const addVariantToCart = (variantId: string) => {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return;
    if (variant.stock <= 0) {
      toast.error("This size is sold out");
      return;
    }
    const variantPricing = getVariantDisplayPrice(product, variant, true);
    addItem({
      productId: product.id,
      variantId: variant.id,
      size: variant.size,
      name: product.name,
      price: variantPricing.price,
      imageUrl: product.imageUrl,
      slug: product.slug,
      stock: variant.stock,
    });
    toast.success("Added to cart");
    setLastAddedVariantId(variant.id);
    setQuickShopOpen(false);
    setAddedOpen(true);
  };

  const handleDesktopAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addVariantToCart(selectedVariantId);
  };

  const handleMobileIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      toast.error("Out of stock");
      return;
    }
    setQuickShopOpen(true);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.08 }}
        className="group relative flex h-full flex-col"
      >
        <Link href={`/products/${product.slug}`} className="flex h-full flex-col">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream-dark shadow-sm transition-shadow duration-300 group-hover:shadow-luxury-sm">
            <SafeImage
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />

            <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
              {pricing.hasSale && (
                <Badge className="bg-brown text-cream shadow-sm">Sale</Badge>
              )}
              {product.isBestSeller && (
                <Badge className="flex items-center gap-1 bg-black/85 text-gold shadow-sm">
                  <Crown className="h-3 w-3" /> Best Seller
                </Badge>
              )}
              {product.isNew && (
                <Badge className="flex items-center gap-1 bg-white/95 text-brown shadow-sm">
                  <Sparkles className="h-3 w-3" /> New
                </Badge>
              )}
            </div>

            <WishlistButton
              productId={product.id}
              className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3"
            />

            {outOfStock && (
              <div className="absolute inset-x-0 bottom-0 bg-black/70 py-1.5 text-center text-[11px] uppercase tracking-widest text-white">
                Out of Stock
              </div>
            )}

            {!outOfStock && (
              <div className="absolute inset-x-0 bottom-0 hidden translate-y-full flex-col gap-2 bg-white/97 p-3 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0 lg:flex">
                <ProductSizeSelector
                  variants={product.variants}
                  selectedId={selectedVariantId}
                  onSelect={setSelectedVariantId}
                  offers={product.offers}
                  size="sm"
                />
                <button
                  type="button"
                  onClick={handleDesktopAdd}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brown py-2 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-brown-light"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Add to Bag
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-1 flex-col px-1">
            {product.category && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-black/45">
                {product.category.name}
              </span>
            )}
            <h3 className="mt-1 font-body text-xl leading-tight">{product.name}</h3>

            <p className="mt-1 flex items-center gap-1.5 text-xs text-black/50">
              {topNote && (
                <>
                  <span>{topNote}</span>
                  <span className="text-black/25">•</span>
                </>
              )}
              <span>
                {defaultVariant.size}
                {hasMultipleSizes &&
                  ` (+${product.variants.length - 1} Size${product.variants.length > 2 ? "s" : ""})`}
              </span>
            </p>

            <div className="mt-auto flex items-end justify-between pt-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-brown sm:text-lg">
                  {formatPrice(pricing.price)}
                </span>
                {pricing.comparePrice && (
                  <span className="text-xs text-black/40 line-through sm:text-sm">
                    {formatPrice(pricing.comparePrice)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleMobileIconClick}
                disabled={outOfStock}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brown text-white shadow-md transition-all hover:scale-105 hover:bg-brown-light active:scale-95 disabled:cursor-not-allowed disabled:bg-black/20 disabled:hover:scale-100 sm:h-10 sm:w-10 lg:hidden"
                aria-label="Quick shop"
              >
                <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </button>
            </div>
          </div>
        </Link>
      </motion.article>

      <QuickShopModal
        open={quickShopOpen}
        onClose={() => setQuickShopOpen(false)}
        product={product}
        onAdd={addVariantToCart}
      />

      <AddedToBagModal
        open={addedOpen}
        onClose={() => setAddedOpen(false)}
        product={product}
        variantId={lastAddedVariantId}
      />
    </>
  );
}