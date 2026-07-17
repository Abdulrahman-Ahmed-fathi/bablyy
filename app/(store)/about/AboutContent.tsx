"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/store/SafeImage";
import { contactSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import dynamic from "next/dynamic";



const AboutGallery = dynamic(
  () => import("@/components/store/AboutGallery").then((m) => m.AboutGallery),
  { ssr: false, loading: () => <div className="h-[650px] w-full skeleton rounded-[36px]" /> }
);


type ContactFormData = z.infer<typeof contactSchema>;

interface AboutContentProps {
  aboutText: string;
  storeName: string;
  heroImageUrl: string | null;
  galleryImages: string[];
  showGallerySection: boolean;
  instagramUrl: string;
}

export function AboutContent({
  aboutText,
  storeName,
  heroImageUrl,
  galleryImages,
  showGallerySection,
  instagramUrl,
}: AboutContentProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema) as never,
  });

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "We could not send your message. Please try again.");
        return;
      }
      toast.success("Your message has been sent.");
      reset();
    } catch {
      toast.error("We could not send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const paragraphs = aboutText ? aboutText.split("\n\n") : [];
  const hasGallery = showGallerySection && galleryImages.length > 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#faf8f5]">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-[#d8c2a8]/20 blur-[140px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-20 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
          {/* Left side */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-sm font-medium uppercase tracking-[0.45em] text-gold"
            >
              {storeName}
            </motion.p>

            {paragraphs.length > 0 ? (
              <>
                <motion.h1
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 font-display text-5xl font-light leading-tight text-[#171717] md:text-7xl"
                >
                  {paragraphs[0]}
                </motion.h1>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-10 h-px w-28 origin-left bg-gold"
                />

                <div className="mt-10 space-y-6">
                  {paragraphs.slice(1).map((para, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.15 }}
                      className="max-w-xl border-l-2 border-gold/30 pl-6 text-lg leading-9 text-[#555]"
                    >
                      {para}
                    </motion.p>
                  ))}
                </div>
              </>
            ) : (
              <>
                <motion.h1
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 font-display text-5xl font-light leading-tight text-[#171717] md:text-7xl"
                >
                  Our Story
                </motion.h1>
                <p className="mt-10 text-lg text-gray-500">Our story is coming soon.</p>
              </>
            )}
          </div>

          {/* Right side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[40px] bg-gold/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[40px] bg-white p-8 shadow-[0_40px_100px_rgba(0,0,0,0.12)]">
              {heroImageUrl ? (
                <SafeImage
                  src={heroImageUrl}
                  alt={storeName}
                  width={700}
                  height={700}
                  className="mx-auto h-[520px] w-full object-contain transition duration-700 hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex h-[520px] items-center justify-center text-lg text-gray-400">
                  No Hero Image
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      {hasGallery && (
        <section className="relative overflow-hidden bg-cream section-padding">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-sm uppercase tracking-[0.4em] text-gold">Follow Our Journey</p>
              <h2 className="mt-5 font-display text-5xl text-black md:text-6xl">{storeName}</h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-black/60">
                Swipe to explore our world.
              </p>
            </motion.div>

            <div className="relative mx-auto mt-16 max-w-6xl">
              <button
                type="button"
                className="about-gallery-prev absolute left-6 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-black hover:text-white md:flex"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="about-gallery-next absolute right-6 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-black hover:text-white md:flex"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <AboutGallery images={galleryImages} storeName={storeName} />
            </div>

            {instagramUrl && (
              <div className="mt-12 flex justify-center">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-brown px-10 text-white hover:bg-gold hover:text-black"
                >
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                    Follow on Instagram
                  </a>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="bg-cream section-padding">
        <div className="mx-auto max-w-container px-4 lg:px-8">
          <div className="mx-auto grid max-w-4xl gap-10 overflow-hidden rounded-3xl border border-cream-dark bg-white shadow-luxury md:grid-cols-2">
            <div className="flex flex-col justify-center bg-[#241811] p-8 text-cream md:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-brown/40">
                <Mail className="h-5 w-5 text-gold" />
              </div>
              <h2 className="mt-6 font-display text-3xl">Get in Touch</h2>
              <p className="mt-3 text-sm leading-relaxed text-cream/70">
                Have a question, or need help choosing your signature scent? Our team is happy
                to help you find the right fragrance.
              </p>
            </div>

            <div className="p-8 md:p-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" {...register("name")} className="mt-1" />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register("email")} className="mt-1" />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" rows={5} {...register("message")} className="mt-1" />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}