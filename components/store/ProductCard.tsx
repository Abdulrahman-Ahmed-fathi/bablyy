"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/cart";
import { formatPrice, parseFragranceNotes } from "@/lib/utils";
import { getProductDisplayPrice, type ProductWithCategory } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/store/WishlistButton";

interface ProductCardProps {
  product: ProductWithCategory;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const pricing = getProductDisplayPrice(product);
  const notes = parseFragranceNotes(product.notes);
  const topNote = notes.top[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: pricing.price,
      imageUrl: product.imageUrl,
      volume: product.volume,
      slug: product.slug,
      stock: product.stock,
    });
    toast.success("Added to cart");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream-dark shadow-sm transition-shadow duration-300 group-hover:shadow-luxury-sm">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {pricing.hasSale && (
            <Badge className="absolute left-3 top-3 bg-brown text-cream">SALE</Badge>
          )}
          <WishlistButton
            productId={product.id}
            className="absolute right-3 top-3"
          />
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/85 p-3 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
            <Button size="sm" className="w-full" onClick={handleAddToCart}>
              Add to Cart
            </Button>
          </div>
        </div>
        <div className="mt-4 px-1">
          {product.category && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-black/45">
              {product.category.name}
            </span>
          )}
          <h3 className="mt-1 font-display text-xl leading-tight">{product.name}</h3>
          {topNote && <p className="mt-1 text-xs text-black/50">{topNote}</p>}
          <div className="mt-2 flex items-center gap-2">
            <span className="font-medium text-brown">{formatPrice(pricing.price)}</span>
            {pricing.comparePrice && (
              <span className="text-sm text-black/40 line-through">
                {formatPrice(pricing.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
