"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Percent, Sparkles } from "lucide-react";
import type { Offer } from "@prisma/client";
import { Button } from "@/components/ui/button";

interface OfferBannerProps {
  offers: (Offer & { product?: { name: string; slug: string } | null })[];
}

export function OfferBanner({ offers }: OfferBannerProps) {
  if (offers.length === 0) return null;

  const sitewide = offers.filter((o) => !o.productId);
  const productOffers = offers.filter((o) => o.productId);

  return (
    <section className="border-y border-cream-dark bg-cream">
      <div className="mx-auto max-w-container space-y-4 px-4 py-8 lg:px-8">
        {sitewide.map((offer) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-black px-6 py-8 text-cream shadow-luxury md:px-10 md:py-10"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brown/30 blur-2xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-cream/20 bg-brown/40">
                  <Sparkles className="h-7 w-7 text-cream" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cream/60">Sitewide Promotion</p>
                  <h3 className="mt-1 font-display text-2xl md:text-3xl">{offer.title}</h3>
                  {offer.description && (
                    <p className="mt-2 max-w-lg text-sm text-cream/75">{offer.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="font-display text-5xl leading-none text-cream md:text-6xl">
                    {offer.discountPct}%
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-cream/60">OFF</p>
                </div>
                <Button variant="ghost" className="border border-cream/30 text-cream hover:bg-cream/10" asChild>
                  <Link href="/products">Shop Now</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {productOffers.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {productOffers.map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between gap-4 rounded-2xl border border-cream-dark bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brown/10 text-brown">
                    <Percent className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-black/50">Product Offer</p>
                    <h4 className="font-display text-xl">{offer.title}</h4>
                    {offer.description && (
                      <p className="mt-1 text-sm text-black/60">{offer.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl text-brown">{offer.discountPct}%</p>
                  {offer.product?.slug && (
                    <Link
                      href={`/products/${offer.product.slug}`}
                      className="mt-1 inline-block text-sm text-brown underline-offset-4 hover:underline"
                    >
                      {offer.product.name}
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
