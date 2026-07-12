"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@prisma/client";

interface HeroSectionProps {
  settings: SiteSettings;
}

export function HeroSection({ settings }: HeroSectionProps) {
  const hasImage = !!settings.heroImageUrl;

  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-black">
      {hasImage ? (
        <div className="absolute inset-0">
          <Image
            src={settings.heroImageUrl}
            alt="Hero"
            fill
            className="object-cover opacity-50"
            priority
            sizes="100vw"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#1a100c] to-black" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      <div className="relative z-10 mx-auto max-w-container px-4 py-32 text-center lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display text-4xl leading-[1.1] text-cream md:text-6xl lg:text-7xl"
        >
          {settings.heroTitle}
        </motion.h1>

        {settings.heroSubtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-cream/75 md:text-lg"
          >
            {settings.heroSubtitle}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            className="min-w-[190px] rounded-full border border-gold/40 bg-gradient-to-r from-gold via-[#d9a441] to-brown px-8 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_18px_45px_-18px_rgba(214,158,46,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#f2c766] hover:via-gold hover:to-brown hover:shadow-[0_22px_55px_-18px_rgba(214,158,46,0.95)]"
            asChild
          >
            <Link href="/products">Shop Now</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
