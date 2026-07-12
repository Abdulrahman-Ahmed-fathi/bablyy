import { NextResponse } from "next/server";
import { getActiveSitewideOffer } from "@/lib/products";

export async function GET() {
  try {
    const offer = await getActiveSitewideOffer();
    return NextResponse.json(offer);
  } catch {
    return NextResponse.json({ error: "Failed to fetch offer" }, { status: 500 });
  }
}
