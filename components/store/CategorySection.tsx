"use client";

import { useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/store/SafeImage";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
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
          <h2 className="mt-3 font-serif text-brown text-3xl md:text-5xl">Collections</h2>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visible.map((cat) => (
                <Link key={cat.id} href={`/products?category=${cat.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-dark shadow-sm transition-shadow duration-500 group-hover:shadow-luxury-sm">
                    <SafeImage
                      src={cat.imageUrl || `${DEFAULT_CATEGORY_IMAGE}&seed=${cat.slug}`}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform  duration-700 ease-out group-hover:scale-[1.06]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute  inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />

                    <div className="absolute right-4 top-4 flex h-10 w-10 -translate-y-2 items-center justify-center rounded-full bg-white/90 text-black opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowUpRight className="h-4 w-4  " />
                    </div>
                  </div>

                  <div className="mt-5 flex items-start  justify-between gap-3 px-1">
                    <div>
                      <h3 className="font-serif text-2xl leading-tight text-black transition-colors group-hover:text-brown">
                        {cat.name}
                      </h3>
                      {cat._count !== undefined && (
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-black/45">
                          {cat._count.products} {cat._count.products === 1 ? "Piece" : "Pieces"}
                        </p>
                      )}
                    </div>
                    <span className="mt-1 h-px w-8 shrink-0 bg-brown/40 transition-all duration-500 group-hover:w-12 group-hover:bg-brown" />
                  </div>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
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