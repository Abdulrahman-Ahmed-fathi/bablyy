"use client";

import Link from "next/link";
import { SafeImage } from "@/components/store/SafeImage";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import type { Offer } from "@prisma/client";
import { useCallback, useEffect, useRef, useState } from "react";

interface OfferBannerProps {
  offers: (Offer & {
    product?: { name: string; slug: string; imageUrl: string } | null;
  })[];
}

function OfferSlide({
  offer,
}: {
  offer: Offer & {
    product?: { name: string; slug: string; imageUrl: string } | null;
  };
}) {
  const isSitewide = !offer.productId;
  const href = offer.product?.slug
    ? `/products/${offer.product.slug}`
    : "/products";
  const imageUrl = isSitewide
    ? offer.imageUrl || null
    : offer.product?.imageUrl || null;
  const displayTitle = isSitewide ? offer.title : (offer.product?.name || offer.title);
  const badge = isSitewide
    ? `${offer.discountPct}% OFF · SITEWIDE`
    : `${offer.discountPct}% OFF`;

  return (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-luxury">
      <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[360px] md:min-h-[380px]">
        {/* Left Panel: Text & CTA */}
        <div className="order-2 md:order-1 md:col-span-7 flex flex-col justify-center px-5 py-6 sm:p-8 md:p-12 bg-[#FAF6F0]">
          {/* Offer Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brown w-fit mb-3 sm:mb-4">
            <Tag className="h-3.5 w-3.5 text-gold" />
            <span>{badge}</span>
          </div>

          {/* Title */}
          <h3 className="font-body text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight text-brown">
            {displayTitle}
          </h3>

          {/* Description */}
          {offer.description && (
            <p className="mt-2.5 sm:mt-3 text-stone-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
              {offer.description}
            </p>
          )}

          {/* CTA Link */}
          <div className="mt-5 sm:mt-6 md:mt-8">
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-xl bg-brown px-5 py-2.5 sm:px-6 sm:py-3 text-xs font-semibold uppercase tracking-widest text-cream transition-all hover:bg-brown-light hover:shadow-md w-fit"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>{isSitewide ? "Shop Collection" : "View Offer"}</span>
              <ArrowRight className="h-4 w-4 ml-0.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Panel: Image Display */}
        <div className="order-1 md:order-2 md:col-span-5 relative min-h-[240px] sm:min-h-[280px] md:min-h-full bg-[#F3EDE6] overflow-hidden flex items-center justify-center p-3 sm:p-5">
          {imageUrl ? (
            <div className="relative h-full w-full min-h-[220px] sm:min-h-[260px] rounded-xl overflow-hidden shadow-inner bg-white/50">
              <SafeImage
                src={imageUrl}
                alt={displayTitle}
                fill
                className="object-contain p-2 sm:p-4 transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
              />
            </div>
          ) : (
            <div className="relative flex h-full w-full min-h-[200px] sm:min-h-[240px] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brown via-[#522919] to-black p-6 text-center text-cream shadow-inner">
              <Sparkles className="h-10 w-10 text-gold mb-3 animate-pulse" />
              <p className="font-body text-xl text-cream font-light">Luxury Fragrance</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-gold/80">Special Edition</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function OfferBanner({ offers }: OfferBannerProps) {
  const count = offers.length;
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (idx: number) => {
      const next = (idx + count) % count;
      setCurrent(next);
    },
    [count]
  );

  const resetAuto = useCallback(() => {
    if (autoRef.current) clearTimeout(autoRef.current);
    autoRef.current = setTimeout(() => goTo(current + 1), 5000);
  }, [current, goTo]);

  useEffect(() => {
    if (count <= 1) return;
    resetAuto();
    return () => {
      if (autoRef.current) clearTimeout(autoRef.current);
    };
  }, [count, current, resetAuto]);

  // Early return AFTER all hooks
  if (count === 0) return null;

  return (
    <section className="overflow-hidden border-y border-cream-dark bg-cream py-10 lg:py-14">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 text-center">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-brown/60">
            Exclusive Offers
          </p>
          <h2 className="mt-1.5 font-body text-3xl font-light text-brown md:text-4xl">
            Limited Time Promotions
          </h2>
        </div>

        {/* Carousel Container — outer wrapper keeps desktop arrows accessible */}
        <div className="relative">
          {/* Desktop floating arrows — live OUTSIDE the overflow-hidden track */}
          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous offer"
                onClick={() => { goTo(current - 1); resetAuto(); }}
                className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 items-center justify-center rounded-full border border-cream-dark bg-white p-2.5 text-brown shadow-luxury transition hover:bg-brown hover:text-white hover:border-brown active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next offer"
                onClick={() => { goTo(current + 1); resetAuto(); }}
                className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 items-center justify-center rounded-full border border-cream-dark bg-white p-2.5 text-brown shadow-luxury transition hover:bg-brown hover:text-white hover:border-brown active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Slider track — overflow-hidden here is the definitive clip boundary */}
          <div className="overflow-hidden rounded-2xl">
            <div
              ref={trackRef}
              className="flex transition-transform duration-700 ease-in-out will-change-transform"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {offers.map((offer) => (
                <div key={offer.id} className="w-full shrink-0">
                  <OfferSlide offer={offer} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots + mobile nav — below the card, never inside the clip area */}
          {count > 1 && (
            <>
              {/* Mobile: ← dots → in one row */}
              <div className="mt-5 flex items-center justify-center gap-3 sm:hidden">
                <button
                  type="button"
                  aria-label="Previous offer"
                  onClick={() => { goTo(current - 1); resetAuto(); }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-dark bg-white text-brown shadow-luxury-sm transition hover:bg-brown hover:text-white hover:border-brown active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center">
                  {offers.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => { goTo(i); resetAuto(); }}
                      className="flex h-8 w-8 items-center justify-center"
                    >
                      <span
                        className={`block h-2 rounded-full transition-all duration-300 ${
                          i === current ? "w-6 bg-brown" : "w-2 bg-cream-dark"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  aria-label="Next offer"
                  onClick={() => { goTo(current + 1); resetAuto(); }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-dark bg-white text-brown shadow-luxury-sm transition hover:bg-brown hover:text-white hover:border-brown active:scale-95"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Desktop: dots only (arrows float on sides above) */}
              <div className="mt-6 hidden items-center justify-center sm:flex">
                {offers.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => { goTo(i); resetAuto(); }}
                    className="flex h-10 w-10 items-center justify-center"
                  >
                    <span
                      className={`block h-2 rounded-full transition-all duration-300 ${
                        i === current ? "w-8 bg-brown" : "w-2 bg-cream-dark"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>

  );
}