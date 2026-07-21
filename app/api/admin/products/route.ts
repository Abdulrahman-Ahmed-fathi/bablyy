import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (categoryId) where.categoryId = categoryId;
    if (active !== null && active !== undefined && active !== "") {
      where.isActive = active === "true";
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: { orderBy: { sortOrder: "asc" } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid product data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const primaryVariant = data.variants.find((v) => v.isDefault) || data.variants[0];
    const totalStock = data.variants.reduce((sum, v) => sum + v.stock, 0);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: primaryVariant.price,
        comparePrice: data.comparePrice,
        stock: totalStock,
        imageUrl: data.imageUrl,
        images: JSON.stringify(data.images || []),
        gender: data.gender,
        categoryId: data.categoryId || null,
        notes: data.notes ? JSON.stringify(data.notes) : null,
        isFeatured: data.isFeatured,
        isBestSeller: data.isBestSeller,
        isNew: data.isNew,
        isActive: data.isActive,
        variants: {
          create: data.variants.map((v, i) => ({
            size: v.size,
            price: v.price,
            stock: v.stock,
            isDefault: v.isDefault,
            sortOrder: i,
          })),
        },
      },
      include: { variants: true },
    });

    revalidatePath("/", "layout");

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}