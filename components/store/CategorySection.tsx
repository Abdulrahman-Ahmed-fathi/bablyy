"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1587017539504-67cfbddac3ff?w=600&h=450&fit=crop";

const PER_PAGE = 3;

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  _count?: { products: number };
}

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(categories.length / PER_PAGE));
  const start = page * PER_PAGE;
  const visible = categories.slice(start, start + PER_PAGE);

  if (categories.length === 0) return null;

  return (
    <section className="section-padding bg-cream">
      <div className="mx-auto max-w-container px-4 lg:px-8">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-brown/70">Browse Perfumes</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl">Collections</h2>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visible.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-black shadow-luxury"
                >
                  <Image
                    src={cat.imageUrl || `${DEFAULT_CATEGORY_IMAGE}&seed=${cat.slug}`}
                    alt={cat.name}
                    fill
                    className="object-cover opacity-75 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                    <div>
                      <h3 className="font-display text-2xl text-cream md:text-3xl">{cat.name}</h3>
                      {cat._count && (
                        <p className="mt-1 text-sm text-cream/60">
                          {cat._count.products} Products
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
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
                aria-label="Previous categories"
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
                aria-label="Next categories"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
