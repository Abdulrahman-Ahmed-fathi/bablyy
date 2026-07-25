import { prisma } from "@/lib/prisma";
import type { Offer, Product, ProductVariant, SiteSettings } from "@prisma/client";
import { getDiscountedPrice, isOfferActive } from "@/lib/utils";

export type ProductWithCategory = Product & {
  category: { id: string; name: string; slug: string } | null;
  offers: Offer[];
  variants: ProductVariant[];
};

export function getActiveProductOffer(
  product: { offers?: Offer[] },
  excludeSitewide = false
): Offer | null {
  const active = (product.offers || []).filter(isOfferActive);
  if (active.length === 0) return null;
  if (excludeSitewide) {
    // Only return product-specific offers (offers that have a productId)
    return active.find((o) => o.productId !== null) || null;
  }
  // Prefer a product-specific offer over a sitewide one if both are active.
  return active.find((o) => o.productId) || active[0];
}
function attachSitewideOffer<T extends { offers: Offer[] }>(
  products: T[],
  sitewideOffer: Offer | null
): T[] {
  if (!sitewideOffer) return products;
  return products.map((p) => ({ ...p, offers: [...p.offers, sitewideOffer] }));
}

export function getDefaultVariant<T extends { isDefault: boolean }>(
  product: { variants: T[] }
): T | null {
  return product.variants.find((v) => v.isDefault) || product.variants[0] || null;
}

export function getVariantDisplayPrice(
  product: { offers?: Offer[] },
  variant: { price: number },
  excludeSitewide = false
): { price: number; comparePrice: number | null; hasSale: boolean } {
  const offer = getActiveProductOffer(product, excludeSitewide);
  if (offer) {
    return {
      price: getDiscountedPrice(variant.price, offer.discountPct),
      comparePrice: variant.price,
      hasSale: true,
    };
  }
  return { price: variant.price, comparePrice: null, hasSale: false };
}

export function getProductDisplayPrice(
  product: {
    price: number;
    comparePrice?: number | null;
    offers?: Offer[];
    variants?: { price: number; isDefault: boolean }[];
  },
  excludeSitewide = false
): {
  price: number;
  comparePrice: number | null;
  hasSale: boolean;
} {
  const defaultVariant =
    product.variants?.find((v) => v.isDefault) || product.variants?.[0];
  const basePrice = defaultVariant ? defaultVariant.price : product.price;

  const offer = getActiveProductOffer(product, excludeSitewide);
  if (offer) {
    return {
      price: getDiscountedPrice(basePrice, offer.discountPct),
      comparePrice: basePrice,
      hasSale: true,
    };
  }
  return {
    price: basePrice,
    comparePrice: product.comparePrice ?? null,
    hasSale: !!product.comparePrice,
  };
}

const DEFAULT_SITE_SETTINGS = {
  id: "singleton",
  storeName: "Maison de Parfum",
  tagline: "Scents that tell your story",
  phone: "",
  email: "",
  address: "",
  instagram: "",
  facebook: "",
  whatsapp: "",
  aboutText: "",
  heroTitle: "Discover Your Signature Scent",
  heroSubtitle: "",
  heroImageUrl: "",
  logoUrl: "",
  showOffersSection: true,
  updatedAt: new Date(),
  aboutGalleryImages: "[]",
  aboutHeroImageUrl: "",
  showAboutGallerySection: true,
  mapLocations: "[]",
  showMapSection: true,
};

export async function getActiveSitewideOffer(): Promise<Offer | null> {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true, productId: null },
    });
    return offers.find(isOfferActive) ?? null;
  } catch (error) {
    console.error("Error fetching sitewide offer:", error);
    return null;
  }
}

export async function getActiveOffers() {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      include: { product: { select: { name: true, slug: true, imageUrl: true } } },
    });
    return offers.filter(isOfferActive);
  } catch (error) {
    console.error("Error fetching active offers:", error);
    return [];
  }
}

export async function getSiteSettings() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: "singleton" } });
    }
    return settings;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return DEFAULT_SITE_SETTINGS as unknown as SiteSettings;
  }
}

const variantInclude = { orderBy: { sortOrder: "asc" as const } };

export async function getFeaturedProducts(limit = 6) {
  try {
    const [products, sitewideOffer] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          offers: { where: { isActive: true } },
          variants: variantInclude,
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      getActiveSitewideOffer(),
    ]);
    return attachSitewideOffer(products, sitewideOffer);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function getBestSellerProducts(limit = 8) {
  try {
    const [products, sitewideOffer] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, isBestSeller: true },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          offers: { where: { isActive: true } },
          variants: variantInclude,
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      getActiveSitewideOffer(),
    ]);
    return attachSitewideOffer(products, sitewideOffer);
  } catch (error) {
    console.error("Error fetching best seller products:", error);
    return [];
  }
}

export async function getProducts(filters?: {
  ids?: string[];
  category?: string | string[];
  gender?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const where: Record<string, unknown> = { isActive: true };

  if (filters?.ids && filters.ids.length > 0) {
    where.id = { in: filters.ids };
  }
  if (filters?.category) {
    if (Array.isArray(filters.category)) {
      where.category = { slug: { in: filters.category } };
    } else if (filters.category.includes(",")) {
      where.category = { slug: { in: filters.category.split(",") } };
    } else {
      where.category = { slug: filters.category };
    }
  }
  if (filters?.gender && filters.gender !== "All") {
    where.gender = filters.gender;
  }
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
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

  try {
    const [products, sitewideOffer] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          offers: { where: { isActive: true } },
          variants: variantInclude,
        },
        orderBy,
      }),
      getActiveSitewideOffer(),
    ]);
    return attachSitewideOffer(products, sitewideOffer);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const [product, sitewideOffer] = await Promise.all([
      prisma.product.findUnique({
        where: { slug },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          offers: { where: { isActive: true } },
          variants: variantInclude,
        },
      }),
      getActiveSitewideOffer(),
    ]);
    if (!product) return null;
    return attachSitewideOffer([product], sitewideOffer)[0];
  } catch (error) {
    console.error(`Error fetching product by slug ${slug}:`, error);
    return null;
  }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
