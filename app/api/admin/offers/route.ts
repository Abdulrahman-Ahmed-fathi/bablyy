import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { offerSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const offers = await prisma.offer.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(offers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = offerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const data = parsed.data;
    const offer = await prisma.offer.create({
      data: {
        title: data.title,
        description: data.description,
        discountPct: data.discountPct,
        productId: data.productId || null,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        isActive: data.isActive,
      },
    });
    return NextResponse.json(offer, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
