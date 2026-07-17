"use client";

import Link from "next/link";
import { SafeImage } from "@/components/store/SafeImage";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@prisma/client";

interface HeroSectionProps {
  settings: SiteSettings;
}

export function HeroSection({ settings }: HeroSectionProps) {
  const hasImage = !!settings.heroImageUrl;

  return (
    <section className="relative overflow-hidden bg-[#201914cc] py-24 lg:py-36">
      {/* Background */}
      {hasImage ? (
        <div className="absolute inset-0">
          <SafeImage
            src={settings.heroImageUrl}
            alt="Hero"
            fill
            className="object-cover opacity-50"
            priority
            fetchPriority="high"
            quality={80}
            sizes="100vw"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[#201914cc]" />
      )}

      {/* Decorative Shapes */}
      <div className="absolute -top-48 -left-48 h-[500px] w-[500px] rounded-full bg-gold/15 blur-[180px]" />
      <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-[180px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
        >
          <div className="grid items-center lg:grid-cols-2">
            {/* Left Side */}
            <div className="p-10 md:p-16 lg:p-20">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="inline-block rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold"
              >
                Each Perfume Is A Story
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-8 font-body text-5xl font-light leading-[1] text-white md:text-6xl xl:text-7xl"
              >
                {settings.heroTitle}
              </motion.h1>

              {settings.heroSubtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mt-8 max-w-lg text-lg leading-8 text-white/70"
                >
                  {settings.heroSubtitle}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="mt-12"
              >
                <Button
                  size="lg"
                  className="rounded-2xl bg-gold px-8 py-6 text-black transition-all hover:scale-105 hover:bg-[#f2c766]"
                  asChild
                >
                  <Link href="/products">Shop Now</Link>
                </Button>
              </motion.div>
            </div>

            {/* Right Side */}
            <div className="relative hidden h-[650px] lg:block">
              {hasImage ? (
                <SafeImage
                  src={settings.heroImageUrl}
                  alt="Hero"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1b1b1b] to-[#0d0d0d]">
                  <span className="text-2xl text-white/30">
                    Your Product Image
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#050505]/30" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}