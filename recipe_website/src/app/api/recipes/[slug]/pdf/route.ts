import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// This is a placeholder for PDF generation
// You'll need to install @react-pdf/renderer and implement the PDF template
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        ingredients: {
          orderBy: { order: "asc" },
        },
        nutritionInfo: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // TODO: Implement PDF generation with @react-pdf/renderer
    // For now, return a simple text response
    const pdfContent = `
Recipe: ${recipe.title}
Author: ${recipe.author.name || "Unknown"}

Description:
${recipe.description}

Prep Time: ${recipe.prepTime} minutes
Cook Time: ${recipe.cookTime} minutes
Total Time: ${recipe.totalTime} minutes
Servings: ${recipe.servings}
Difficulty: ${recipe.difficulty}

Ingredients:
${recipe.ingredients
  .map((ing, i) => `${i + 1}. ${ing.amount} ${ing.unit} ${ing.name}`)
  .join("\n")}

Instructions:
${recipe.instructions}

${
  recipe.nutritionInfo
    ? `
Nutrition Information (per serving):
Calories: ${recipe.nutritionInfo.calories}
Protein: ${recipe.nutritionInfo.protein}g
Carbohydrates: ${recipe.nutritionInfo.carbohydrates}g
Fat: ${recipe.nutritionInfo.fat}g
${recipe.nutritionInfo.fiber ? `Fiber: ${recipe.nutritionInfo.fiber}g` : ""}
${recipe.nutritionInfo.sugar ? `Sugar: ${recipe.nutritionInfo.sugar}g` : ""}
${recipe.nutritionInfo.sodium ? `Sodium: ${recipe.nutritionInfo.sodium}mg` : ""}
`
    : ""
}
    `.trim();

    // Return as text for now
    return new NextResponse(pdfContent, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${recipe.slug}.txt"`,
      },
    });

    // TODO: Replace with actual PDF generation:
    // const pdf = await generateRecipePDF(recipe);
    // return new NextResponse(pdf, {
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': `attachment; filename="${recipe.slug}.pdf"`,
    //   },
    // });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
