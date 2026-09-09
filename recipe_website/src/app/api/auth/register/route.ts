import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, pin } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password and PIN
    const hashedPassword = await hash(password, 12);
    const hashedPin = await hash(pin, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user (email not verified yet)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        pin: hashedPin,
        emailVerified: null,
      },
    });

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: tokenExpires,
      },
    });

    // TODO: Send verification email using nodemailer
    // const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
    // await sendVerificationEmail(email, name, verificationUrl);

    console.log("User registered. Verification email would be sent to:", email);
    console.log(
      "Verification URL:",
      `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`
    );

    return NextResponse.json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
