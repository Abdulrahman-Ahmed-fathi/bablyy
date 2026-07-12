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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-6 shadow-sm ${
        accent === "amber"
          ? "border-amber-200 bg-amber-50"
          : "border-stone-200 bg-white"
      }`}
    >
      <p className={`text-sm ${accent === "amber" ? "text-amber-800" : "text-stone-500"}`}>{title}</p>
      <p className={`mt-2 text-3xl font-semibold ${accent === "amber" ? "text-amber-900" : "text-stone-900"}`}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </p>
    </motion.div>
  );
}
