"use client";

import Link from "next/link";
import { SafeImage } from "@/components/store/SafeImage";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles  } from "lucide-react";
import type { Offer } from "@prisma/client";

interface OfferBannerProps {
  offers: (Offer & {
    product?: { name: string; slug: string; imageUrl: string } | null;
  })[];
}

function Diamond() {
  return <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />;
}

interface OfferCardProps {
  title: string;
  statLabel: string;
  href: string;
  ctaLabel: string;
  imageUrl?: string | null;
  featured?: boolean;
}

function OfferCard({ title, statLabel, href, ctaLabel, imageUrl, featured }: OfferCardProps) {
  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-[28px] border border-gold/25 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury-sm ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <div className={`flex h-full ${featured ? "min-h-[240px]" : "min-h-[220px]"}`}>
        {/* Photo panel */}
        <div className="relative w-[42%] shrink-0 overflow-hidden">
          {imageUrl ? (
            <SafeImage
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 40vw, 20vw"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-black via-[#3c2616] to-black">
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              
              <Sparkles className="relative h-10 w-10 text-cream" />
            </div>
          )}
        </div>

        {/* Text panel with chevron notch */}
        <div
          className="relative -ml-4 flex flex-1 flex-col justify-center bg-cream px-8 py-8"
          style={{
            clipPath: "polygon(20px 0, 100% 0, 100% 100%, 20px 100%, 0 50%)",
          }}
        >
          <h3 className="font-body text-2xl leading-tight text-brown md:text-3xl">
            {title}
          </h3>

          <div className="mt-4 flex items-center gap-3">
            <Diamond />
            <span className="text-x font-bold uppercase tracking-[0.2em] text-red-900">
              {statLabel}
            </span>
          </div>

          <span className="mt-6 inline-flex w-fit items-center gap-2 text-x font-body uppercase tracking-[0.25em] text-black transition-colors group-hover:text-brown">
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function OfferBanner({ offers }: OfferBannerProps) {
  if (offers.length === 0) return null;

  const sitewide = offers.filter((o) => !o.productId);
  const productOffers = offers.filter((o) => o.productId);

  return (
    <section className="border-y border-cream-dark bg-cream">
      <div className="mx-auto max-w-container px-4 py-12 lg:px-8 lg:py-16">
        <div className="mb-10 text-center">
          <p className="text-x uppercase font-serif tracking-[0.3em] text-brown/70">Limited Time Only</p>
          <h2 className="mt-3 font-serif text-3xl text-brown md:text-5xl">Exclusive Offers</h2>
        </div>

        <div className="grid gap-5  sm:grid-cols-2 lg:grid-cols-3">
          {sitewide.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="sm:col-span-2 lg:col-span-3 "
            >
              <OfferCard
                title={offer.title}
                statLabel={`${offer.discountPct}% Off · Sitewide`}
                href="/products"
                ctaLabel="Shop Now"
                imageUrl={null}
                featured
              />
            </motion.div>
          ))}

          {productOffers.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <OfferCard
                title={offer.product?.name || offer.title}
                statLabel={`${offer.discountPct}% Off`}
                href={offer.product?.slug ? `/products/${offer.product.slug}` : "/products"}
                ctaLabel="View Offer"
                imageUrl={offer.product?.imageUrl}
                
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
