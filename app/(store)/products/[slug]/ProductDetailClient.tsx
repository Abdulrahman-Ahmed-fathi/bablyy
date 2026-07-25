"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Minus, Plus, Copy, Share2 } from "lucide-react";
import { SafeImage } from "@/components/store/SafeImage";
import { FragranceNotes } from "@/components/store/FragranceNotes";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductCarousel } from "@/components/store/ProductCarousel";
import { ProductSizeSelector } from "@/components/store/ProductSizeSelector";
import { RecentlyViewed, addRecentlyViewed } from "@/components/store/RecentlyViewed";
import { useCartStore } from "@/lib/cart";
import {
  formatPrice,
  parseFragranceNotes,
  parseJsonArray,
} from "@/lib/utils";
import {
  getDefaultVariant,
  getVariantDisplayPrice,
  type ProductWithCategory,
} from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface ProductDetailClientProps {
  product: ProductWithCategory;
  related: ProductWithCategory[];
}

export function ProductDetailClient({
  product,
  related,
}: ProductDetailClientProps) {
  const images = [product.imageUrl, ...parseJsonArray(product.images)];
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);

  const defaultVariant = getDefaultVariant(product);
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id || "");
  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || defaultVariant;

  const pricing = selectedVariant
    ? getVariantDisplayPrice(product, selectedVariant)
    : { price: product.price, comparePrice: null, hasSale: false };
  const notes = parseFragranceNotes(product.notes);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariantId]);

  useEffect(() => {
    if (!selectedVariant) return;
    addRecentlyViewed({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: pricing.price,
      imageUrl: product.imageUrl,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  const stock = selectedVariant?.stock ?? 0;
  const stockStatus =
    stock <= 0
      ? { label: "Out of Stock", color: "text-red-600" }
      : stock <= 5
      ? { label: "Low Stock", color: "text-amber-600" }
      : { label: "In Stock", color: "text-green-600" };

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    const catalogPricing = getVariantDisplayPrice(product, selectedVariant, true);
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      size: selectedVariant.size,
      name: product.name,
      price: catalogPricing.price,
      imageUrl: product.imageUrl,
      slug: product.slug,
      stock: selectedVariant.stock,
      quantity,
    });
    toast.success("Added to cart");
  };

  const shareWhatsApp = () => {
    const url = window.location.href;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${product.name} - ${url}`)}`,
      "_blank"
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };

  return (
    <div className="mx-auto max-w-container px-4 py-12 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[3fr_4fr]">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream-dark shadow-luxury-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <SafeImage
                  src={images[activeImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative h-20 w-16 overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? "border-brown" : "border-transparent"
                  }`}
                >
                  <SafeImage src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={headerRef}>
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-xs uppercase tracking-widest text-brown"
            >
              {product.category.name}
            </Link>
          )}
          {product.isBestSeller && (
            <Badge className="ms-2 bg-black text-gold">Bestseller</Badge>
          )}
          <h1 className="mt-2 font-body text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-1 text-sm text-black/50">
            {product.gender ? `${product.gender} Perfume` : "Perfume"}
            {selectedVariant && ` (${selectedVariant.size})`}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-body text-2xl text-brown">
              {formatPrice(pricing.price)}
            </span>
            {pricing.comparePrice && (
              <span className="text-lg text-black/40 line-through">
                {formatPrice(pricing.comparePrice)}
              </span>
            )}
            {pricing.hasSale && <Badge className="bg-brown text-cream">Sale</Badge>}
          </div>

          <p className="mt-6 leading-relaxed text-black/80">{product.description}</p>

          {product.variants.length > 0 && (
            <div className="mt-8">
              <span className="text-sm uppercase tracking-wider text-black/70">Size</span>
              <ProductSizeSelector
                variants={product.variants}
                selectedId={selectedVariantId}
                onSelect={setSelectedVariantId}
                offers={product.offers}
                size="lg"
                className="mt-3 grid-cols-3 sm:max-w-md"
              />
            </div>
          )}

          <div className="mt-6">
            <FragranceNotes notes={notes} />
          </div>

          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm uppercase tracking-wider">Quantity</span>
            <div className="flex items-center rounded-lg border border-cream-dark">
               
              <button
                type="button"
                className="px-3 py-2"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center">{quantity}</span>
              <button
                type="button"
                className="px-3 py-2"
                onClick={() =>
                  setQuantity(Math.min(quantity + 1, stock, 10))
                }
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className={`text-sm ${stockStatus.color}`}>{stockStatus.label}</span>
           
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={handleAddToCart}
            disabled={stock <= 0}
          >
            Add to Cart
          </Button>

          <div className="mt-4 flex gap-3">
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="me-2 h-4 w-4" /> Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={shareWhatsApp}>
              <Share2 className="me-2 h-4 w-4" /> WhatsApp
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Full Description</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6 leading-relaxed">
            {product.description}
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-cream-dark/30 pt-16">
          <h2 className="mb-8 font-body text-2xl text-brown">You May Also Like</h2>
          <ProductCarousel>
            {related.map((p, i) => (
              <div key={p.id} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </ProductCarousel>
        </section>
      )}

      <RecentlyViewed currentId={product.id} />

      {showStickyBar && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-cream-dark bg-cream p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:hidden"
        >
          <div>
            <span className="font-body text-xl text-brown">
              {formatPrice(pricing.price)}
            </span>
            {selectedVariant && (
              <span className="ms-2 text-xs text-black/50">{selectedVariant.size}</span>
            )}
          </div>
          <Button onClick={handleAddToCart} disabled={stock <= 0}>
            Add to Cart
          </Button>
        </motion.div>
      )}
    </div>
  );
}