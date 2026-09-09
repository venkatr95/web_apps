import { isUserAdminComprehensive } from "@/lib/adminUtils";
import { adminClient } from "@/sanity/lib/adminClient";
import { client } from "@/sanity/lib/client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET - Fetch documents by type
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "product";
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const offset = page * limit;

    // Build search filter
    let searchFilter = "";
    if (search) {
      // Create a flexible search that looks in common text fields
      searchFilter = ` && (
        title match "*${search}*" ||
        name match "*${search}*" ||
        email match "*${search}*" ||
        slug.current match "*${search}*" ||
        description match "*${search}*"
      )`;
    }

    // Build the query
    const query = `*[_type == "${type}"${searchFilter}] | order(_updatedAt desc) [${offset}...${offset + limit}]`;
    const countQuery = `count(*[_type == "${type}"${searchFilter}])`;

    // Execute queries in parallel
    const [documents, total] = await Promise.all([
      client.fetch(query),
      client.fetch(countQuery),
    ]);

    return NextResponse.json({
      documents,
      total,
      page,
      limit,
      hasNextPage: offset + limit < total,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new document
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

    const documentData = await req.json();

    // Validate required fields
    if (!documentData._type) {
      return NextResponse.json(
        { error: "Document type is required" },
        { status: 400 }
      );
    }

    // Clean the data - remove any existing system fields except _type
    const cleanData = Object.fromEntries(
      Object.entries(documentData).filter(
        ([key]) => !key.startsWith("_") || key === "_type"
      )
    );

    // Ensure _type is present
    if (!cleanData._type) {
      return NextResponse.json(
        { error: "Document _type is required" },
        { status: 400 }
      );
    }

    // Add metadata
    const newDocument = {
      ...cleanData,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    } as any; // Type assertion to handle dynamic document structure

    // Create the document
    const result = await adminClient.create(newDocument);

    return NextResponse.json({
      success: true,
      document: result,
    });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
