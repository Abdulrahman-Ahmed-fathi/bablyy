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

const StoreMap = dynamic(
  () => import("@/components/store/StoreMap").then((m) => m.StoreMap),
  { ssr: false, loading: () => <div className="h-[450px] w-full skeleton rounded-[32px]" /> }
);


type ContactFormData = z.infer<typeof contactSchema>;

interface AboutContentProps {
  aboutText: string;
  storeName: string;
  heroImageUrl: string | null;
  galleryImages: string[];
  showGallerySection: boolean;
  instagramUrl: string;
  phone: string;
  email: string;
  address: string;
  facebookUrl: string;
  whatsapp: string;
  showMapSection: boolean;
  mapLocations: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  }[];
}

export function AboutContent({
  aboutText,
  storeName,
  heroImageUrl,
  galleryImages,
  showGallerySection,
  instagramUrl,
  phone,
  email,
  address,
  facebookUrl,
  whatsapp,
  showMapSection,
  mapLocations,
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
            <div className="flex flex-col justify-between bg-[#241811] p-8 text-cream md:p-10">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-brown/40">
                  <Mail className="h-5 w-5 text-gold" />
                </div>
                <h2 className="mt-6 font-display text-3xl">Get in Touch</h2>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">
                  Have a question, or need help choosing your signature scent? Our team is happy
                  to help you find the right fragrance.
                </p>
              </div>

              {/* Dynamic Contact details */}
              <div className="mt-8 space-y-4 border-t border-gold/20 pt-8">
                {phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <a href={`tel:${phone}`} className="hover:text-gold transition-colors">
                      {phone}
                    </a>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4.5 w-4.5 text-gold shrink-0" />
                    <a href={`mailto:${email}`} className="hover:text-gold transition-colors">
                      {email}
                    </a>
                  </div>
                )}
                {address && (
                  <div className="flex items-start gap-3 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="shrink-0 mt-0.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span className="text-cream/80">{address}</span>
                  </div>
                )}
              </div>

              {/* Social links */}
              {(instagramUrl || facebookUrl || whatsapp) && (
                <div className="mt-8 border-t border-gold/20 pt-6">
                  <p className="text-xs uppercase tracking-wider text-gold font-semibold mb-3">Connect With Us</p>
                  <div className="flex items-center gap-4">
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-brown/20 text-cream hover:bg-gold hover:text-[#241811] transition-all duration-300"
                        title="Instagram"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                      </a>
                    )}
                    {facebookUrl && (
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-brown/20 text-cream hover:bg-gold hover:text-[#241811] transition-all duration-300"
                        title="Facebook"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                      </a>
                    )}
                    {whatsapp && (
                      <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-brown/20 text-cream hover:bg-gold hover:text-[#241811] transition-all duration-300"
                        title="WhatsApp"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
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

          {/* Map Section */}
          {showMapSection && mapLocations.length > 0 && (
            <div className="mx-auto max-w-4xl mt-12">
              <StoreMap locations={mapLocations} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}