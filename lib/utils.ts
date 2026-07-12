import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(sequence: number): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(sequence).padStart(4, "0");
  return `ORD-${date}-${seq}`;
}

export function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseFragranceNotes(notes: string | null): {
  top: string[];
  heart: string[];
  base: string[];
} {
  if (!notes) return { top: [], heart: [], base: [] };
  try {
    const parsed = JSON.parse(notes);
    return {
      top: parsed.top || [],
      heart: parsed.heart || [],
      base: parsed.base || [],
    };
  } catch {
    return { top: [], heart: [], base: [] };
  }
}

export function getDiscountedPrice(
  price: number,
  discountPct: number
): number {
  return Math.round(price * (1 - discountPct / 100) * 100) / 100;
}

export function isOfferActive(offer: {
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
}): boolean {
  if (!offer.isActive) return false;
  const now = new Date();
  if (offer.startsAt && now < offer.startsAt) return false;
  if (offer.endsAt && now > offer.endsAt) return false;
  return true;
}
