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
    include: { variants: { orderBy: { sortOrder: "asc" } } },
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
          comparePrice: product.comparePrice ?? undefined,
          imageUrl: product.imageUrl,
          images: parseJsonArray(product.images),
          gender: product.gender as "Unisex" | "Men" | "Women" | undefined,
          categoryId: product.categoryId || "",
          notes,
          variants: product.variants.map((v) => ({
            size: v.size,
            price: v.price,
            stock: v.stock,
            isDefault: v.isDefault,
          })),
          isFeatured: product.isFeatured,
          isBestSeller: product.isBestSeller,
          isNew: product.isNew,
          isActive: product.isActive,
        }}
      />
    </div>
  );
}