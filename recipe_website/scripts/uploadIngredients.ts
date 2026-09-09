import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadIngredients() {
  try {
    console.log("🔄 Starting ingredient upload...");

    // Read ingredients from JSON file
    const jsonPath = path.join(process.cwd(), "ingredients.json");
    const jsonData = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(jsonData);

    const ingredients = data.Ingredients || data.ingredients || data;

    if (!Array.isArray(ingredients)) {
      throw new Error("Invalid ingredients data format");
    }

    console.log(`📋 Found ${ingredients.length} ingredients to upload`);

    let added = 0;
    let skipped = 0;

    for (const ingredient of ingredients) {
      const name = ingredient.trim();
      if (!name) continue;

      const slug = slugify(name);

      try {
        await prisma.ingredientCatalog.upsert({
          where: { slug },
          update: {
            name,
          },
          create: {
            name,
            slug,
            usageCount: 0,
          },
        });
        added++;
        if (added % 50 === 0) {
          console.log(`  ✓ Processed ${added} ingredients...`);
        }
      } catch (error) {
        console.error(`  ✗ Failed to add "${name}":`, error);
        skipped++;
      }
    }

    console.log("\n✅ Upload complete!");
    console.log(`  Added/Updated: ${added}`);
    console.log(`  Skipped: ${skipped}`);
  } catch (error) {
    console.error("❌ Error uploading ingredients:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

uploadIngredients();
