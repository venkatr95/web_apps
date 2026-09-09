import { isUserAdmin } from "@/lib/adminUtils";
import { client } from "@/sanity/lib/client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json({
        debug: {
          error: "No user ID from auth",
          isLoggedIn: false,
        },
      });
    }

    // Get current user details from Clerk
    const clerk = await clerkClient();
    const currentClerkUser = await clerk.users.getUser(currentUserId);
    const userEmail = currentClerkUser.primaryEmailAddress?.emailAddress;

    // Check environment admin status
    const isEnvAdmin = userEmail ? isUserAdmin(userEmail) : false;

    // Get all users from Sanity to see the current user
    const allUsers = await client.fetch(
      `*[_type == "user"]{_id, clerkUserId, email, role, isAdmin, firstName, lastName}`
    );

    // Find current user in Sanity
    const currentSanityUser = allUsers.find(
      (u: { clerkUserId: string }) => u.clerkUserId === currentUserId
    );

    // Check admin emails from environment
    const adminEmails =
      process.env.NEXT_PUBLIC_ADMIN_EMAIL?.split(",").map((e) => e.trim()) ||
      [];

    return NextResponse.json({
      debug: {
        clerkUserId: currentUserId,
        userEmail,
        adminEmails,
        isEnvAdmin,
        currentSanityUser,
        allSanityUsers: allUsers.length,
        sanityUserExists: !!currentSanityUser,
        sanityUserRole: currentSanityUser?.role,
        sanityUserIsAdmin: currentSanityUser?.isAdmin,
        finalAdminStatus:
          isEnvAdmin ||
          currentSanityUser?.role === "admin" ||
          currentSanityUser?.isAdmin === true,
      },
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json({
      debug: {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
}
