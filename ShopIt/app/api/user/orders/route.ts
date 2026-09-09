import { getMyOrders } from "@/sanity/helpers";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const ordersPerPage = 20;

    // Use the same helper function as the page component
    const orderData = await getMyOrders(userId, page, ordersPerPage);
    const { orders, totalCount, totalPages, hasNextPage, hasPrevPage } =
      orderData;

    return NextResponse.json({
      success: true,
      orders,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
