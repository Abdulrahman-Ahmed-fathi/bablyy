import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderEmails } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getActiveSitewideOffer, getSiteSettings, getVariantDisplayPrice } from "@/lib/products";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many orders. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentOrder = await prisma.order.findFirst({
      where: {
        email: data.email,
        createdAt: { gte: fiveMinutesAgo },
        items: {
          every: {
            variantId: { in: data.items.map((i) => i.variantId) },
          },
        },
      },
      include: { items: true },
    });

    if (recentOrder && recentOrder.items.length === data.items.length) {
      return NextResponse.json(recentOrder);
    }

    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: {
        offers: { where: { isActive: true } },
        variants: true,
      },
    });

    const unavailable: string[] = [];
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);
      if (!product || !variant || variant.stock < item.quantity) {
        unavailable.push(item.variantId);
      }
    }

    if (unavailable.length > 0) {
      return NextResponse.json(
        { error: "Some items are unavailable", unavailable },
        { status: 409 }
      );
    }

    let subtotal = 0;
    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const variant = product.variants.find((v) => v.id === item.variantId)!;
      const pricing = getVariantDisplayPrice(product, variant);
      const lineTotal = pricing.price * item.quantity;
      subtotal += lineTotal;
      return {
        productId: product.id,
        variantId: variant.id,
        size: variant.size,
        quantity: item.quantity,
        price: pricing.price,
        name: product.name,
      };
    });

    const sitewideOffer = await getActiveSitewideOffer();
    let discount = 0;
    if (sitewideOffer) {
      discount = Math.round(subtotal * (sitewideOffer.discountPct / 100) * 100) / 100;
    }
    const total = Math.round((subtotal - discount) * 100) / 100;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: today } },
    });
    const orderNumber = generateOrderNumber(todayOrders + 1);

    const order = await prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        const updatedVariant = await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
        if (updatedVariant.stock < 0) {
          throw new Error(`Insufficient stock for variant ${item.variantId}`);
        }

        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        if (updatedProduct.stock < 0) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
      }

      return tx.order.create({
        data: {
          orderNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          governorate: data.governorate,
          notes: data.notes,
          subtotal,
          discount,
          total,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });
    });

    const settings = await getSiteSettings();
    await sendOrderEmails(order, settings.storeName);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}