import { client } from "@/sanity/lib/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;

    // Get the asset from Sanity
    const asset = await client.fetch(`*[_id == "${ref}"][0]`);

    if (!asset || !asset.url) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Redirect to the Sanity CDN URL
    return NextResponse.redirect(asset.url);
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
