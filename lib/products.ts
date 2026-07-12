import { prisma } from "@/lib/prisma";
import type { Offer, Product } from "@prisma/client";
import { getDiscountedPrice, isOfferActive } from "@/lib/utils";

export type ProductWithCategory = Product & {
  category: { id: string; name: string; slug: string } | null;
  offers: Offer[];
};

export function getActiveProductOffer(product: { offers?: Offer[] }): Offer | null {
  const active = (product.offers || []).find(isOfferActive);
  return active ?? null;
}

export function getProductDisplayPrice(product: {
  price: number;
  comparePrice?: number | null;
  offers?: Offer[];
}): {
  price: number;
  comparePrice: number | null;
  hasSale: boolean;
} {
  const offer = getActiveProductOffer(product);
  if (offer) {
    return {
      price: getDiscountedPrice(product.price, offer.discountPct),
      comparePrice: product.price,
      hasSale: true,
    };
  }
  return {
    price: product.price,
    comparePrice: product.comparePrice ?? null,
    hasSale: !!product.comparePrice,
  };
}

export async function getActiveSitewideOffer(): Promise<Offer | null> {
  const offers = await prisma.offer.findMany({
    where: { isActive: true, productId: null },
  });
  return offers.find(isOfferActive) ?? null;
}

export async function getActiveOffers() {
  const offers = await prisma.offer.findMany({
    where: { isActive: true },
    include: { product: { select: { name: true, slug: true } } },
  });
  return offers.filter(isOfferActive);
}

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "singleton" } });
  }
  return settings;
}

export async function getFeaturedProducts(limit = 6) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      offers: { where: { isActive: true } },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function getProducts(filters?: {
  category?: string;
  gender?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const where: Record<string, unknown> = { isActive: true };

  if (filters?.category) {
    where.category = { slug: filters.category };
  }
  if (filters?.gender && filters.gender !== "All") {
    where.gender = filters.gender;
  }
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }
  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined)
      (where.price as Record<string, number>).gte = filters.minPrice;
    if (filters.maxPrice !== undefined)
      (where.price as Record<string, number>).lte = filters.maxPrice;
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (filters?.sort === "price-asc") orderBy = { price: "asc" };
  if (filters?.sort === "price-desc") orderBy = { price: "desc" };
  if (filters?.sort === "newest") orderBy = { createdAt: "desc" };

  return prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      offers: { where: { isActive: true } },
    },
    orderBy,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      offers: { where: { isActive: true } },
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}
