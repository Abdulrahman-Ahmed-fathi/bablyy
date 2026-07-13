"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { OrderTimeline } from "@/components/store/OrderTimeline";
import { Button } from "@/components/ui/button";

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [orderInfo, setOrderInfo] = useState<{
    firstName?: string;
    phone?: string;
  }>({});

  useEffect(() => {
    const stored = sessionStorage.getItem("lastOrder");
    if (stored) {
      setOrderInfo(JSON.parse(stored));
    }
  }, []);

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201000000000";
  const message = `Hello, I placed order ${orderNumber}. I'd like to track my order.`;

  return (
    <div className="mx-auto max-w-container px-4 py-24 text-center lg:px-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
      >
        <svg viewBox="0 0 52 52" className="h-12 w-12">
          <motion.path
            fill="none"
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
            d="M14 27l8 8 16-16"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </svg>
      </motion.div>

      <h1 className="font-display text-4xl md:text-5xl">Order Confirmed</h1>

      {orderNumber && (
        <p className="mt-6 font-display text-2xl text-brown">{orderNumber}</p>
      )}

      <p className="mx-auto mt-6 max-w-md text-black/70">
        Thank you for your order. We have received it and will contact you shortly.
      </p>
      <p className="mx-auto mt-6 max-w-md text-black/70">
        COPY this order number {orderNumber} to track your order.
      </p>

      {orderInfo.firstName && (
        <p className="mt-4 text-sm text-black/60">
          {orderInfo.firstName} · {orderInfo.phone}
        </p>
      )}

      <OrderTimeline status="PENDING" />

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button asChild>
          <Link href="/products">Shop More</Link>
        </Button>
        <Button variant="outline" asChild>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Track via WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
