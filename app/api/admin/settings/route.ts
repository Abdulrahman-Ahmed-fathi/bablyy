import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validations";
import { parseJsonArray } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: "singleton" } });
    }
    return NextResponse.json({
      ...settings,
      aboutGalleryImages: parseJsonArray(settings.aboutGalleryImages),
      mapLocations: parseJsonArray(settings.mapLocations),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { aboutGalleryImages, mapLocations, ...rest } = parsed.data;
    const data = {
      ...rest,
      aboutGalleryImages: JSON.stringify(aboutGalleryImages),
      mapLocations: JSON.stringify(mapLocations),
    };

    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    revalidatePath("/", "layout");

    return NextResponse.json({
      ...settings,
      aboutGalleryImages: parseJsonArray(settings.aboutGalleryImages),
      mapLocations: parseJsonArray(settings.mapLocations),
    });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}