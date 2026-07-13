import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^01\d{9}$/, "Phone must be 11 digits starting with 01"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  governorate: z.string().min(1, "Governorate is required"),
  notes: z.string().optional(),
});

const imagePathSchema = z
  .string()
  .min(1, "Image is required")
  .refine(
    (val) => val.startsWith("/uploads/") || /^https?:\/\//.test(val),
    "Upload an image or provide a valid URL"
  );


const optionalPositivePrice = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  return val;
}, z.coerce.number().positive("Compare price must be positive").optional());

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().min(10, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  comparePrice: optionalPositivePrice,
  imageUrl: imagePathSchema,
  images: z.array(imagePathSchema).max(4).default([]),
  stock: z.coerce.number().int().min(0),
  volume: z.string().optional().nullable(),
  gender: z.enum(["Unisex", "Men", "Women"]).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  notes: z
    .object({
      top: z.array(z.string()),
      heart: z.array(z.string()),
      base: z.array(z.string()),
    })
    .optional()
    .nullable(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  imageUrl: z.string().optional().default(""),
});

export const offerSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional().nullable(),
  discountPct: z.coerce.number().min(1).max(100),
  productId: z.string().optional().nullable(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const settingsSchema = z.object({
  storeName: z.string().min(1),
  tagline: z.string(),
  phone: z.string(),
  email: z.string().email().or(z.literal("")),
  address: z.string(),
  instagram: z.string(),
  facebook: z.string(),
  whatsapp: z.string(),
  aboutText: z.string(),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  heroImageUrl: z.string(),
  logoUrl: z.string(),
  showOffersSection: z.boolean().default(true),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
});

export const createOrderSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^01\d{9}$/),
  address: z.string().min(5),
  city: z.string().min(2),
  governorate: z.string().min(1),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const EGYPTIAN_GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Port Said",
  "Suez",
  "Luxor",
  "Aswan",
  "Asyut",
  "Beheira",
  "Beni Suef",
  "Dakahlia",
  "Damietta",
  "Faiyum",
  "Gharbia",
  "Ismailia",
  "Kafr El Sheikh",
  "Matrouh",
  "Minya",
  "Monufia",
  "New Valley",
  "North Sinai",
  "Qena",
  "Red Sea",
  "Sharqia",
  "Sohag",
  "South Sinai",
] as const;

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type OfferFormData = z.infer<typeof offerSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
