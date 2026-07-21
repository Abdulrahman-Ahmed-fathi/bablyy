import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const data = parsed.data;
    if (data.slug) {
      const existing = await prisma.product.findFirst({
        where: { slug: data.slug, NOT: { id: params.id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
    }

    const primaryVariant = data.variants
      ? data.variants.find((v) => v.isDefault) || data.variants[0]
      : undefined;
    const totalStock = data.variants
      ? data.variants.reduce((sum, v) => sum + v.stock, 0)
      : undefined;

    const product = await prisma.$transaction(async (tx) => {
      if (data.variants !== undefined) {
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: params.id },
        });

        const incomingSizes = data.variants.map((v) => v.size);

        // Delete variants not present in incoming request
        const toDelete = existingVariants.filter((v) => !incomingSizes.includes(v.size));
        if (toDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: toDelete.map((v) => v.id) } },
          });
        }

        // Upsert/Create/Update remaining
        for (let i = 0; i < data.variants.length; i++) {
          const v = data.variants[i];
          const match = existingVariants.find((ev) => ev.size === v.size);
          if (match) {
            await tx.productVariant.update({
              where: { id: match.id },
              data: {
                price: v.price,
                stock: v.stock,
                isDefault: v.isDefault,
                sortOrder: i,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: params.id,
                size: v.size,
                price: v.price,
                stock: v.stock,
                isDefault: v.isDefault,
                sortOrder: i,
              },
            });
          }
        }
      }

      return tx.product.update({
        where: { id: params.id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.comparePrice !== undefined && { comparePrice: data.comparePrice }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
          ...(data.images !== undefined && { images: JSON.stringify(data.images) }),
          ...(data.gender !== undefined && { gender: data.gender }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
          ...(data.notes !== undefined && {
            notes: data.notes ? JSON.stringify(data.notes) : null,
          }),
          ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
          ...(data.isBestSeller !== undefined && { isBestSeller: data.isBestSeller }),
          ...(data.isNew !== undefined && { isNew: data.isNew }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(primaryVariant !== undefined && { price: primaryVariant.price }),
          ...(totalStock !== undefined && { stock: totalStock }),
        },
        include: { variants: true },
      });
    });

    revalidatePath("/", "layout");

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update failed:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orderCount = await prisma.orderItem.count({
      where: { productId: params.id },
    });

    if (orderCount > 0) {
      await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ softDeleted: true });
    }

    await prisma.product.delete({ where: { id: params.id } });
    revalidatePath("/", "layout");
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}