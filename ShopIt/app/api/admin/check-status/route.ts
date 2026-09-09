import { isUserAdmin } from "@/lib/adminUtils";
import { client } from "@/sanity/lib/client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json({ isAdmin: false });
    }

    // Get current user details from Clerk
    const clerk = await clerkClient();
    const currentClerkUser = await clerk.users.getUser(currentUserId);
    const userEmail = currentClerkUser.primaryEmailAddress?.emailAddress;

    // Quick check: environment variable
    if (userEmail && isUserAdmin(userEmail)) {
      return NextResponse.json({ isAdmin: true, source: "environment" });
    }

    // Check Sanity role
    const currentUser = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: currentUserId }
    );

    const isAdminByRole = currentUser?.role === "admin";
    const isAdminByFlag = currentUser?.isAdmin === true; // Legacy support
    const finalIsAdmin = isAdminByRole || isAdminByFlag;

    console.log("Admin status check:", {
      userId: currentUserId,
      userEmail,
      sanityUser: currentUser,
      isAdminByRole,
      isAdminByFlag,
      finalIsAdmin,
    });

    return NextResponse.json({
      isAdmin: finalIsAdmin,
      source: isAdminByRole
        ? "sanity_role"
        : isAdminByFlag
          ? "sanity_flag"
          : "none",
      user: currentUser
        ? {
            id: currentUser._id,
            email: currentUser.email,
            role: currentUser.role,
            isAdmin: currentUser.isAdmin,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false, error: "Internal error" });
  }
}
