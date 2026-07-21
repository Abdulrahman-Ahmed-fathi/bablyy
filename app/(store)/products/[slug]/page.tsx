import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";
import {
  getProductBySlug,
  getProducts,
  getDefaultVariant,
  getProductDisplayPrice,
  getSiteSettings,
} from "@/lib/products";
import { absoluteUrl } from "@/lib/site-url";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product Not Found" };
  const description =
    product.description.slice(0, 160) ||
    `Shop ${product.name} at Maison de Parfum. Premium fragrance with fast delivery across Egypt.`;
  const title = `${product.name} | Maison de Parfum`;
  const canonical = absoluteUrl(`/products/${product.slug}`);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: canonical,
      images: [{ url: product.imageUrl }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const [product, settings] = await Promise.all([
    getProductBySlug(params.slug),
    getSiteSettings(),
  ]);
  if (!product || !product.isActive) notFound();

  const related = product.categoryId
    ? (
        await getProducts({ category: product.category?.slug })
      ).filter((p) => p.id !== product.id).slice(0, 4)
    : [];

  const defaultVariant = getDefaultVariant(product);
  const { price } = getProductDisplayPrice(product);
  const stock = defaultVariant?.stock ?? product.stock;
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const imageUrl = product.imageUrl.startsWith("http")
    ? product.imageUrl
    : absoluteUrl(product.imageUrl);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: imageUrl,
    url: productUrl,
    ...(product.category?.name ? { category: product.category.name } : {}),
    brand: {
      "@type": "Brand",
      name: settings.storeName,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "EGP",
      price: price.toFixed(2),
      availability:
        stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
