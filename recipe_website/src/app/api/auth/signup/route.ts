import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = signUpSchema.parse(body);

    console.log("[Signup] Starting signup process for:", validatedData.email);

    // Check database connection
    try {
      console.log("[Signup] Verifying database connection...");
      await prisma.$connect();
      console.log("[Signup] Database connected successfully");
    } catch (dbError) {
      console.error("[Signup] Database connection failed:", dbError);
      return NextResponse.json(
        {
          error: "Database connection failed. Please try again later.",
          details:
            process.env.NODE_ENV === "development"
              ? dbError instanceof Error
                ? dbError.message
                : String(dbError)
              : undefined,
        },
        { status: 503 }
      );
    }

    // Check if user already exists
    console.log("[Signup] Checking if user exists...");
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    console.log("[Signup] User exists:", !!existingUser);

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password and PIN
    console.log("[Signup] Hashing credentials...");
    const hashedPassword = await hash(validatedData.password, 12);
    const hashedPin = await hash(validatedData.pin, 12);

    // Create user
    console.log("[Signup] Creating user in database...");
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        pin: hashedPin,
        emailVerified: null, // Email not verified yet
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    console.log("[Signup] User created successfully:", user.id);

    // Generate verification token
    console.log("[Signup] Generating verification token...");
    const verificationToken = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    // Store verification token
    console.log("[Signup] Storing verification token...");
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: expiresAt,
      },
    });
    console.log("[Signup] Verification token stored");

    // Send verification email
    try {
      console.log("[Signup] Sending verification email...");
      await sendVerificationEmail(user.email, verificationToken);
      console.log("[Signup] Verification email sent successfully");
    } catch (emailError) {
      console.error("[Signup] Failed to send verification email:", emailError);
      // Don't fail the signup if email fails - user can request a new verification email
    }

    console.log("[Signup] ✅ Signup process completed successfully");
    return NextResponse.json(
      {
        user,
        message:
          "User created successfully. Please check your email to verify your account.",
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}
