"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { contactSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";

type ContactFormData = z.infer<typeof contactSchema>;

interface AboutContentProps {
  aboutText: string;
  storeName: string;
}

export function AboutContent({ aboutText, storeName }: AboutContentProps) {
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

  return (
    <div className="mx-auto max-w-container px-4 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-brown/70">{storeName}</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">About</h1>
      </div>

      <div className="mx-auto mt-12 max-w-2xl">
        {aboutText ? (
          <div className="space-y-4 text-center font-display text-lg leading-relaxed text-black/80">
            {aboutText.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <p className="text-center text-black/50">Our story is coming soon.</p>
        )}
      </div>

      <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-cream-dark bg-white p-8 shadow-sm">
        <h2 className="text-center font-display text-2xl">Get in Touch</h2>
        <p className="mt-2 text-center text-sm text-black/60">Have a question or need help choosing a scent? Send us a message.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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
  );
}
