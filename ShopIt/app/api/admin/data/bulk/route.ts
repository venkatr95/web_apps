import { isUserAdminComprehensive } from "@/lib/adminUtils";
import { adminClient } from "@/sanity/lib/adminClient";
import { client } from "@/sanity/lib/client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST - Bulk operations (delete, update, etc.)
export async function POST(req: NextRequest) {
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

    const { operation, documentIds, updates } = await req.json();

    if (!operation || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: "Operation and document IDs are required" },
        { status: 400 }
      );
    }

    let results = [];

    switch (operation) {
      case "delete":
        // Bulk delete
        for (const id of documentIds) {
          try {
            await adminClient.delete(id);
            results.push({ id, status: "deleted", success: true });
          } catch (error) {
            results.push({
              id,
              status: "error",
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
        break;

      case "update":
        // Bulk update
        if (!updates) {
          return NextResponse.json(
            { error: "Updates are required for bulk update operation" },
            { status: 400 }
          );
        }

        const cleanUpdates = {
          ...updates,
          _updatedAt: new Date().toISOString(),
        };

        for (const id of documentIds) {
          try {
            const result = await adminClient
              .patch(id)
              .set(cleanUpdates)
              .commit();
            results.push({
              id,
              status: "updated",
              success: true,
              data: result,
            });
          } catch (error) {
            results.push({
              id,
              status: "error",
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
        break;

      case "export":
        // Bulk export
        const documents = await client.fetch(`*[_id in $ids]`, {
          ids: documentIds,
        });
        return NextResponse.json({
          success: true,
          operation: "export",
          data: documents,
          count: documents.length,
        });

      default:
        return NextResponse.json(
          { error: "Invalid operation. Supported: delete, update, export" },
          { status: 400 }
        );
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: errorCount === 0,
      operation,
      results,
      summary: {
        total: documentIds.length,
        successful: successCount,
        failed: errorCount,
      },
    });
  } catch (error) {
    console.error("Error in bulk operation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
