import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

const pinLoginSchema = z.object({
  email: z.string().email(),
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, pin } = pinLoginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.pin) {
      return NextResponse.json(
        { error: "Invalid email or PIN" },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in" },
        { status: 403 }
      );
    }

    // Verify PIN
    const isPinValid = await compare(pin, user.pin);

    if (!isPinValid) {
      return NextResponse.json(
        { error: "Invalid email or PIN" },
        { status: 401 }
      );
    }

    // Return success (NextAuth will handle session creation)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("PIN login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
