import { mkdir, writeFile, stat } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function extensionFor(file: File) {
  const fromName = path.extname(file.name).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(fromName)) {
    return fromName;
  }
  return file.type === "image/svg+xml" ? ".svg" : ".jpg";
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${crypto.randomUUID()}${extensionFor(file)}`;
    const filePath = path.join(uploadsDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return NextResponse.json({ error: "Uploaded file is empty" }, { status: 400 });
    }

    await writeFile(filePath, buffer);

    const written = await stat(filePath);
    if (written.size !== buffer.length) {
      return NextResponse.json({ error: "File write incomplete, please retry" }, { status: 500 });
    }

    // Brief pause so the OS finishes flushing the file before the client renders it
    // via next/image — mitigates a Windows filesystem-flush race with Next's optimizer.
    await new Promise((resolve) => setTimeout(resolve, 300));

    return NextResponse.json({ path: `/uploads/${filename}` });
  } catch {
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}