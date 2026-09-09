import { isUserAdmin } from "@/lib/adminUtils";
import { adminClient } from "@/sanity/lib/adminClient";
import { client } from "@/sanity/lib/client";
import { UserRole } from "@/types/user";
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

    const { userId, newRole } = await req.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "User ID and new role are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = ["user", "admin", "seller", "employee"];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Get current user details from Clerk
    const clerk = await clerkClient();
    const currentClerkUser = await clerk.users.getUser(currentUserId);
    const userEmail = currentClerkUser.primaryEmailAddress?.emailAddress;

    console.log("🔍 Checking admin status for:", {
      userId: currentUserId,
      userEmail,
    });

    // Check if current user is admin via environment variable first
    const isAdminByEmail = userEmail ? isUserAdmin(userEmail) : false;
    console.log("📧 Admin by email check:", isAdminByEmail);

    if (!isAdminByEmail) {
      // Fallback: check if user exists in Sanity and has admin role
      console.log("🔍 Checking Sanity database for admin role...");
      const currentUser = await client.fetch(
        `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
        { clerkUserId: currentUserId }
      );

      console.log("👤 Current user from Sanity:", {
        found: !!currentUser,
        role: currentUser?.role,
        isAdmin: currentUser?.isAdmin,
      });

      if (
        !currentUser ||
        (currentUser.role !== "admin" && !currentUser.isAdmin)
      ) {
        console.error("❌ Access denied: User is not admin", {
          userEmail,
          currentUser: currentUser
            ? { role: currentUser.role, isAdmin: currentUser.isAdmin }
            : null,
        });
        return NextResponse.json(
          { error: "Only admins can change user roles" },
          { status: 403 }
        );
      }
      console.log("✅ Admin access confirmed via database");
    } else {
      console.log("✅ Admin access confirmed via environment variable");
    }

    // Update the user's role using admin client with elevated permissions
    console.log("📝 Updating user role in Sanity:", { userId, newRole });

    try {
      // First, check if the user exists in Sanity by ID or clerkUserId
      let existingUser = await client.fetch(
        `*[_type == "user" && _id == $userId][0]`,
        { userId }
      );

      // If not found by Sanity ID, try by Clerk ID
      if (!existingUser) {
        existingUser = await client.fetch(
          `*[_type == "user" && clerkUserId == $userId][0]`,
          { userId }
        );
      }

      console.log("🔍 User to update:", {
        found: !!existingUser,
        currentRole: existingUser?.role,
        userId,
      });

      if (!existingUser) {
        console.log("📝 User not found in Sanity, creating new user record...");

        // Get user details from Clerk
        const clerk = await clerkClient();
        // Try to get user by the provided ID (could be Clerk ID or Sanity ID)
        let clerkUser;
        try {
          clerkUser = await clerk.users.getUser(userId);
        } catch (error) {
          // If userId is not a Clerk ID, it might be a Sanity ID
          console.log(
            "ID is not a Clerk ID, this shouldn't happen in user creation flow"
          );
          return NextResponse.json(
            { error: "Invalid user ID for new user creation" },
            { status: 404 }
          );
        }

        if (!clerkUser) {
          console.error("❌ User not found in Clerk:", userId);
          return NextResponse.json(
            { error: "User not found in authentication system" },
            { status: 404 }
          );
        }

        // Generate a unique Sanity ID for the new user
        const sanityUserId = `user-${clerkUser.id}`;

        // Create new Sanity user record
        const newUserData = {
          _type: "user",
          _id: sanityUserId,
          clerkUserId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          role: newRole,
          isActive: true, // Make them active when assigning a role
          activatedAt: new Date().toISOString(),
          activatedBy: currentUserId,
          loyaltyPoints: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log("📝 Creating new user:", newUserData);

        const createResult = await adminClient.create(newUserData);
        console.log("✅ User created successfully:", createResult);

        return NextResponse.json({
          success: true,
          message: "User role set successfully (new user created)",
          data: createResult,
        });
      }

      // Use the existing user's Sanity ID for the update
      const updateResult = await adminClient
        .patch(existingUser._id)
        .set({
          role: newRole,
          updatedAt: new Date().toISOString(),
        })
        .commit();

      console.log("✅ Role update successful:", updateResult);

      return NextResponse.json({
        success: true,
        message: "User role updated successfully",
        data: updateResult,
      });
    } catch (sanityError: any) {
      console.error("❌ Sanity update error:", {
        error: sanityError,
        message: sanityError.message,
        statusCode: sanityError.statusCode,
        details: sanityError.details,
      });

      if (sanityError.statusCode === 403) {
        return NextResponse.json(
          {
            error: "Insufficient permissions to update user roles in Sanity",
            details:
              "The SANITY_API_TOKEN needs Editor permissions. Please check your Sanity project settings.",
          },
          { status: 403 }
        );
      }
      throw sanityError;
    }
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
