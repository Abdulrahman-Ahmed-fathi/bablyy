import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { offerSchema } from "@/lib/validations";
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
    const parsed = offerSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const data = parsed.data;
    const offer = await prisma.offer.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.discountPct !== undefined && { discountPct: data.discountPct }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.productId !== undefined && { productId: data.productId || null }),
        ...(data.startsAt !== undefined && {
          startsAt: data.startsAt ? new Date(data.startsAt) : null,
        }),
        ...(data.endsAt !== undefined && {
          endsAt: data.endsAt ? new Date(data.endsAt) : null,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    revalidatePath("/", "layout");

    return NextResponse.json(offer);
  } catch {
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
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
    await prisma.offer.delete({ where: { id: params.id } });

    revalidatePath("/", "layout");

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
