import { NextResponse } from "next/server";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const type = file.type || "";
    if (!type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await stat(uploadsDir);
    } catch {
      await mkdir(uploadsDir, { recursive: true });
    }
    const ext = type.split("/")[1] || "png";
    const name =
      Date.now().toString() +
      "-" +
      Math.random().toString(36).slice(2, 8) +
      "." +
      ext;
    const filePath = path.join(uploadsDir, name);
    await writeFile(filePath, buffer);
    const url = "/uploads/" + name;
    return NextResponse.json({ url }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { path: fileUrl } = await request.json();
    if (!fileUrl || typeof fileUrl !== "string") {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }
    if (!fileUrl.startsWith("/uploads/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const filePath = path.join(
      process.cwd(),
      "public",
      fileUrl.replace("/", path.sep)
    );
    await unlink(filePath);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
