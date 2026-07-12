import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";
import { getProductBySlug, getProducts } from "@/lib/products";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | Maison de Parfum`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [{ url: product.imageUrl }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product || !product.isActive) notFound();

  const related = product.categoryId
    ? (
        await getProducts({ category: product.category?.slug })
      ).filter((p) => p.id !== product.id).slice(0, 4)
    : [];

  return <ProductDetailClient product={product} related={related} />;
}
