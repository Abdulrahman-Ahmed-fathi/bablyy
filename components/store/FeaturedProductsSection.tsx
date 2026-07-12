"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Button } from "@/components/ui/button";
import type { ProductWithCategory } from "@/lib/products";

const PER_PAGE = 4;

interface FeaturedProductsSectionProps {
  products: ProductWithCategory[];
}

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const start = page * PER_PAGE;
  const visible = products.slice(start, start + PER_PAGE);

  if (products.length === 0) return null;

  return (
    <section className="section-padding bg-cream-dark/40">
      <div className="mx-auto max-w-container px-4 lg:px-8">
        <div className="mb-14 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-brown/70">Featured</p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl">Our Finest Selections</h2>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <ProductGrid products={visible} />
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous products"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i === page ? "bg-brown" : "bg-cream-dark"
                    }`}
                    aria-label={`Page ${i + 1}`}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next products"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Button asChild>
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
