"use server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const amountCredits = parseInt(body?.credits || "100", 10);
    const currency = (body?.currency as string) || "usd";

    const amountCents =
      amountCredits === 100 ? 500 : amountCredits === 225 ? 1000 : 500;

    const sessionCheckout = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      payment_method_types: ["card", "link"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `${amountCredits} Credits`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url:
        (process.env.NEXTAUTH_URL || "http://localhost:3000") +
        "/profile/billing?status=success",
      cancel_url:
        (process.env.NEXTAUTH_URL || "http://localhost:3000") +
        "/profile/billing?status=cancel",
      metadata: {
        app_user_id: session.user.id,
        credits: amountCredits.toString(),
      },
    });

    return NextResponse.json({ url: sessionCheckout.url });
  } catch (error) {
    console.error("Stripe create Checkout Session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
