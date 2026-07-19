"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  accent?: "default" | "amber";
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);
  const [text, setText] = useState("0");

  useEffect(() => {
    spring.set(value);
    return display.on("change", (v) => setText(v));
  }, [value, spring, display]);

  return <span>{text}</span>;
}

export function StatsCard({ title, value, prefix, suffix, accent = "default" }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border p-6 shadow-luxury-sm transition-all duration-200 hover:shadow-luxury ${
        accent === "amber"
          ? "border-gold/30 bg-gold/5"
          : "border-cream-dark/60 bg-white"
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wider ${accent === "amber" ? "text-amber-800" : "text-stone-400"}`}>
        {title}
      </p>
      <p className={`mt-3 font-body text-4xl font-light tracking-wide ${accent === "amber" ? "text-amber-950" : "text-brown"}`}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </p>
    </motion.div>
  );
}
