"use client";

import { motion } from "framer-motion";

const steps = [
  { key: "PENDING", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

const statusOrder = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

interface OrderTimelineProps {
  status?: string;
}

export function OrderTimeline({ status = "PENDING" }: OrderTimelineProps) {
  const currentIndex = status === "CANCELLED" ? -1 : statusOrder.indexOf(status);

  if (status === "CANCELLED") {
    return (
      <p className="mx-auto mt-10 max-w-lg text-center text-sm text-red-600">Cancelled</p>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = step.key === status;
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.15 }}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                  isCurrent
                    ? "bg-brown text-white ring-4 ring-brown/20"
                    : isActive
                    ? "bg-brown text-white"
                    : "bg-cream-dark text-black/40"
                }`}
              >
                {i + 1}
              </motion.div>
              <span className={`mt-2 text-xs ${isActive ? "text-brown" : "text-black/40"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
