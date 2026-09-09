import { isUserAdminComprehensive } from "@/lib/adminUtils";
import { client } from "@/sanity/lib/client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    // Get current user details to check admin status
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    const userEmail = currentUser.primaryEmailAddress?.emailAddress;

    // Check if current user is admin
    if (!userEmail || !(await isUserAdminComprehensive(userId, userEmail))) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all brands from Sanity
    const brandsQuery = `
      *[_type == "brand"] | order(title asc) {
        _id,
        title,
        slug,
        description,
        logo,
        _createdAt,
        _updatedAt
      }
    `;

    const brands = await client.fetch(brandsQuery);

    return NextResponse.json({
      brands: brands || [],
      totalCount: brands ? brands.length : 0,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
