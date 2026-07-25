"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import type { ProductWithCategory } from "@/lib/products";

interface BestSellersSectionProps {
  products: ProductWithCategory[];
}

export function BestSellersSection({ products }: BestSellersSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-cream/10 section-padding">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brown/30 blur-[120px]" />

      <div className="relative mx-auto max-w-container px-4 lg:px-8">
        <div className="mb-12 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <Crown className="h-4 w-4 text-gold" />
              <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
                Customer Favorites
              </p>
            </div>
            <h2 className="mt-3 font-serif text-3xl text-brown md:text-5xl">
              Best Sellers
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-cream/60 md:mx-0">
              The scents our customers keep coming back for.
            </p>
          </div>
          <Button asChild>
            <Link href="/products">View All Products</Link>
          </Button>
        </div>

        <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="relative w-[68%] shrink-0 snap-start sm:w-[42%] lg:w-auto"
            >
              <div className="rounded-xl bg-cream p-2">
                <ProductCard product={product} index={i} priority={i < 2} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}