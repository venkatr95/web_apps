import { client } from "@/sanity/lib/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Check if current user is admin
    const currentUser = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userId }
    );

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can perform this migration" },
        { status: 403 }
      );
    }

    // Find users without roles
    const usersWithoutRoles = await client.fetch(
      `*[_type == "user" && !defined(role)]`
    );

    console.log(`Found ${usersWithoutRoles.length} users without roles`);

    if (usersWithoutRoles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All users already have roles assigned",
        updated: 0,
      });
    }

    // Update users with default role
    const transaction = client.transaction();

    usersWithoutRoles.forEach((user: any) => {
      transaction.patch(user._id, {
        set: {
          role: "user", // Default role
          updatedAt: new Date().toISOString(),
        },
      });
    });

    await transaction.commit();

    return NextResponse.json({
      success: true,
      message: `Updated ${usersWithoutRoles.length} users with default roles`,
      updated: usersWithoutRoles.length,
    });
  } catch (error) {
    console.error("Error migrating user roles:", error);
    return NextResponse.json(
      { error: "Failed to migrate user roles" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Check current user role and admin status
    const currentUser = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: userId }
    );

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get stats about users with/without roles
    const usersWithRoles = await client.fetch(
      `count(*[_type == "user" && defined(role)])`
    );

    const usersWithoutRoles = await client.fetch(
      `count(*[_type == "user" && !defined(role)])`
    );

    const totalUsers = await client.fetch(`count(*[_type == "user"])`);

    return NextResponse.json({
      currentUser: {
        role: currentUser.role,
        isAdmin: currentUser.role === "admin",
      },
      stats: {
        totalUsers,
        usersWithRoles,
        usersWithoutRoles,
      },
    });
  } catch (error) {
    console.error("Error fetching role migration stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
