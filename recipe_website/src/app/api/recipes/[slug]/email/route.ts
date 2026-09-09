import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
  message: z.string().optional(),
  includePDF: z.boolean().default(true),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    // Optional: require authentication
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { email, message, includePDF } = emailSchema.parse(body);

    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        ingredients: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // TODO: Implement email sending with nodemailer
    // For now, just log the email details
    console.log("Email Recipe Request:", {
      to: email,
      recipeTitle: recipe.title,
      recipeSlug: recipe.slug,
      message,
      includePDF,
      from: session?.user?.email || "noreply@recipewebsite.com",
    });

    // TODO: Implement actual email sending:
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: parseInt(process.env.SMTP_PORT || '587'),
    //   secure: false,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASSWORD,
    //   },
    // });
    //
    // const recipeUrl = `${process.env.NEXTAUTH_URL}/recipes/${recipe.slug}`;
    // const emailBody = `
    //   ${message ? `${message}\n\n` : ''}
    //   Check out this recipe: ${recipe.title}
    //   ${recipe.description}
    //
    //   View the full recipe here: ${recipeUrl}
    // `;
    //
    // await transporter.sendMail({
    //   from: process.env.SMTP_FROM,
    //   to: email,
    //   subject: `Recipe: ${recipe.title}`,
    //   text: emailBody,
    //   html: `<p>${emailBody.replace(/\n/g, '<br>')}</p>`,
    //   attachments: includePDF ? [
    //     {
    //       filename: `${recipe.slug}.pdf`,
    //       content: await generateRecipePDF(recipe),
    //     }
    //   ] : [],
    // });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully (simulation)",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
