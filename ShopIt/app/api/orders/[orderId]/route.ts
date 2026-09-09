import { client } from "@/sanity/lib/client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Query order by ID with all necessary fields for OrderTimeline
    const order = await client.fetch(
      `*[_type == "order" && _id == $orderId && clerkUserId == $userId][0] {
        _id,
        _createdAt,
        _updatedAt,
        orderNumber,
        customerName,
        email,
        phone,
        clerkUserId,
        products[] {
          _key,
          quantity,
          product-> {
            _id,
            name,
            slug,
            price,
            description,
            discountedPrice,
            category,
            images[] {
              asset-> {
                _id,
                url
              }
            }
          }
        },
        totalPrice,
        currency,
        amountDiscount,
        address {
          name,
          address,
          city,
          state,
          zip
        },
        status,
        orderDate,
        paymentMethod,
        paymentStatus,
        subtotal,
        shipping,
        tax,
        stripeCustomerId,
        stripePaymentIntentId,
        stripeCheckoutSessionId,
        clerkPaymentId,
        clerkPaymentStatus,
        deliveryDate,
        trackingNumber,
        notes
      }`,
      { orderId, userId }
    );

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or you don't have permission to view it" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update order status (for admin/employee use)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const body = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // For security, only allow certain fields to be updated
    const allowedUpdates = [
      "status",
      "paymentStatus",
      "trackingNumber",
      "notes",
      "deliveryDate",
    ];
    const updates: any = {};

    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add timestamp for when the update occurred
    updates._updatedAt = new Date().toISOString();

    // Update the order
    const updatedOrder = await client.patch(orderId).set(updates).commit();

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
