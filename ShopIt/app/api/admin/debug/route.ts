import { getAdminEmails, isUserAdmin } from "@/lib/adminUtils";
import { client } from "@/sanity/lib/client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

    // Check admin status via environment variable
    const adminEmails = getAdminEmails();
    const isAdminViaEnv = userEmail ? isUserAdmin(userEmail) : false;

    // Check if user exists in Sanity and their role
    const currentUser = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: currentUserId }
    );

    return NextResponse.json({
      debug: {
        clerkUserId: currentUserId,
        userEmail,
        adminEmails,
        isAdminViaEnv,
        sanityUser: currentUser
          ? {
              id: currentUser._id,
              email: currentUser.email,
              role: currentUser.role,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
            }
          : null,
        inSanity: !!currentUser,
        isAdminViaSanity: currentUser?.role === "admin",
        hasAdminAccess: isAdminViaEnv || currentUser?.role === "admin",
      },
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
