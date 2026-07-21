import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get("page") || 1);
    const limit = 20;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [orders, total, statusCountsRaw] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { _count: { select: { items: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const counts = Object.fromEntries(
      statusCountsRaw.map((s) => [s.status, s._count.status])
    );

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      statusCounts: counts,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
