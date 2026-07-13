import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { parseFragranceNotes, parseJsonArray } from "@/lib/utils";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) notFound();

  const notes = parseFragranceNotes(product.notes);

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium">Edit Product</h2>
      <ProductForm
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice ?? undefined,
          imageUrl: product.imageUrl,
          images: parseJsonArray(product.images),
          stock: product.stock,
          volume: product.volume,
          gender: product.gender as "Unisex" | "Men" | "Women" | undefined,
          categoryId: product.categoryId || "",
          notes,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
        }}
      />
    </div>
  );
}
