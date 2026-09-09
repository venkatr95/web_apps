import { isUserAdmin, isUserAdminComprehensive } from "@/lib/adminUtils";
import { adminClient } from "@/sanity/lib/adminClient";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get current user details from Clerk
    const clerk = await clerkClient();
    const currentClerkUser = await clerk.users.getUser(currentUserId);
    const userEmail = currentClerkUser.primaryEmailAddress?.emailAddress;

    // Check if user is in environment admin list (for initial setup)
    const isEnvAdmin = userEmail && isUserAdmin(userEmail);

    // Check if user is already admin via comprehensive check
    const isCurrentlyAdmin =
      userEmail && (await isUserAdminComprehensive(currentUserId, userEmail));

    // Allow access if user is in env admin list OR already admin
    if (!userEmail || (!isEnvAdmin && !isCurrentlyAdmin)) {
      return NextResponse.json(
        {
          error:
            "Only users specified in NEXT_PUBLIC_ADMIN_EMAIL can setup admin roles",
        },
        { status: 403 }
      );
    }

    // Create or update the current user in Sanity with admin role
    const userData = {
      _type: "user",
      clerkUserId: currentUserId,
      firstName: currentClerkUser.firstName || "",
      lastName: currentClerkUser.lastName || "",
      email: userEmail,
      role: "admin",
      isActive: true,
      loyaltyPoints: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Try to create or update user
    const result = await adminClient.createOrReplace({
      _id: `user-${currentUserId}`,
      ...userData,
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created/updated successfully in Sanity",
      userId: result._id,
    });
  } catch (error) {
    console.error("Error setting up admin:", error);
    return NextResponse.json(
      {
        error: "Failed to setup admin user",
        details: error instanceof Error ? error.message : "Unknown error",
        instructions:
          "Make sure SANITY_API_TOKEN has Editor permissions in your Sanity project settings",
      },
      { status: 500 }
    );
  }
}
