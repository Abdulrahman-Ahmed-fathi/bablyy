import { NextResponse } from "next/server";
import { getFeaturedProducts } from "@/lib/products";

export async function GET() {
  try {
    const products = await getFeaturedProducts(6);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch featured products" },
      { status: 500 }
    );
  }
}
