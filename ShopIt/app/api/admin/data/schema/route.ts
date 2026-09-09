import { isUserAdminComprehensive } from "@/lib/adminUtils";
import { client } from "@/sanity/lib/client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET - Get schema information for document types
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    // Check admin status
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    const userEmail = currentUser.primaryEmailAddress?.emailAddress;
    const isAdmin = await isUserAdminComprehensive(userId, userEmail);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get document counts for each type
    const documentTypes = [
      "product",
      "category",
      "brand",
      "banner",
      "blog",
      "blogCategory",
      "user",
      "order",
      "review",
      "subscription",
      "userAccessRequest",
      "sentNotification",
      "contact",
      "author",
      "address",
    ];

    const counts = await Promise.all(
      documentTypes.map(async (type) => {
        const count = await client.fetch(`count(*[_type == "${type}"])`);
        return { type, count };
      })
    );

    // Get sample documents for schema inference
    const samples = await Promise.all(
      documentTypes.map(async (type) => {
        const sample = await client.fetch(`*[_type == "${type}"][0]`);
        return { type, sample };
      })
    );

    const schemaInfo = documentTypes.map((type) => {
      const countInfo = counts.find((c) => c.type === type);
      const sampleInfo = samples.find((s) => s.type === type);

      return {
        type,
        count: countInfo?.count || 0,
        fields: sampleInfo?.sample ? Object.keys(sampleInfo.sample) : [],
        sample: sampleInfo?.sample || null,
      };
    });

    return NextResponse.json({
      schemas: schemaInfo,
      totalDocuments: counts.reduce((sum, c) => sum + c.count, 0),
    });
  } catch (error) {
    console.error("Error fetching schema info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
