import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seedApprovedRecipes() {
  console.log("🌱 Seeding approved recipes...");

  // Create or get admin user
  const adminEmail = "admin@recipeapp.com";
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    const hashedPassword = await hash("admin123", 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin User",
        password: hashedPassword,
        emailVerified: new Date(),
        role: "ADMIN",
      },
    });
    console.log("✓ Created admin user");
  }

  // Create categories if they don't exist
  const categories = [
    { name: "Appetizers", slug: "appetizers" },
    { name: "Dessert", slug: "dessert" },
    { name: "Main Course", slug: "main-course" },
    { name: "Breakfast", slug: "breakfast" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✓ Created categories");

  // Create approved recipes
  const recipes = [
    {
      title: "Classic Margherita Pizza",
      slug: "classic-margherita-pizza",
      description:
        "A traditional Italian pizza with fresh tomatoes, mozzarella, and basil.",
      imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
      prepTime: 20,
      cookTime: 15,
      totalTime: 35,
      servings: 4,
      difficulty: "MEDIUM",
      cuisine: "ITALIAN",
      category: "WORLD_RECIPES",
      mealCourse: "DINNER",
      country: "ITALY",
      instructions:
        "1. Preheat oven to 475°F\n2. Roll out pizza dough\n3. Add sauce and toppings\n4. Bake for 12-15 minutes",
      published: true,
      approved: true,
      authorId: admin.id,
    },
    {
      title: "Butter Chicken",
      slug: "butter-chicken",
      description: "Rich and creamy Indian curry with tender chicken pieces.",
      imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
      prepTime: 30,
      cookTime: 40,
      totalTime: 70,
      servings: 6,
      difficulty: "MEDIUM",
      cuisine: "INDIAN",
      category: "WORLD_RECIPES",
      mealCourse: "DINNER",
      country: "INDIA",
      instructions:
        "1. Marinate chicken\n2. Cook in butter and spices\n3. Add cream and tomatoes\n4. Simmer until done",
      published: true,
      approved: true,
      authorId: admin.id,
    },
    {
      title: "Chicken Tacos",
      slug: "chicken-tacos",
      description:
        "Delicious Mexican tacos with seasoned chicken and fresh toppings.",
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
      prepTime: 15,
      cookTime: 20,
      totalTime: 35,
      servings: 4,
      difficulty: "EASY",
      cuisine: "MEXICAN",
      category: "WORLD_RECIPES",
      mealCourse: "LUNCH",
      country: "MEXICO",
      instructions:
        "1. Season and cook chicken\n2. Warm tortillas\n3. Assemble with toppings\n4. Serve immediately",
      published: true,
      approved: true,
      authorId: admin.id,
    },
    {
      title: "Pad Thai",
      slug: "pad-thai",
      description: "Classic Thai stir-fried noodles with shrimp and peanuts.",
      imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e",
      prepTime: 20,
      cookTime: 15,
      totalTime: 35,
      servings: 2,
      difficulty: "MEDIUM",
      cuisine: "THAI",
      category: "WORLD_RECIPES",
      mealCourse: "DINNER",
      country: "THAILAND",
      instructions:
        "1. Soak noodles\n2. Stir-fry shrimp and vegetables\n3. Add noodles and sauce\n4. Top with peanuts",
      published: true,
      approved: true,
      authorId: admin.id,
    },
    {
      title: "French Onion Soup",
      slug: "french-onion-soup",
      description:
        "Classic French soup with caramelized onions and melted cheese.",
      imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
      prepTime: 15,
      cookTime: 60,
      totalTime: 75,
      servings: 4,
      difficulty: "EASY",
      cuisine: "FRENCH",
      category: "WORLD_RECIPES",
      mealCourse: "DINNER",
      country: "FRANCE",
      instructions:
        "1. Caramelize onions\n2. Add broth and simmer\n3. Top with bread and cheese\n4. Broil until golden",
      published: true,
      approved: true,
      authorId: admin.id,
    },
    {
      title: "Masala Dosa",
      slug: "masala-dosa",
      description: "Crispy South Indian crepe filled with spiced potato.",
      imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976",
      prepTime: 480,
      cookTime: 30,
      totalTime: 510,
      servings: 4,
      difficulty: "HARD",
      cuisine: "SOUTH_INDIAN",
      category: "WORLD_RECIPES",
      mealCourse: "BREAKFAST",
      country: "INDIA",
      instructions:
        "1. Prepare and ferment batter\n2. Cook dosa until crispy\n3. Fill with potato masala\n4. Serve with chutney",
      published: true,
      approved: true,
      authorId: admin.id,
    },
  ];

  for (const recipe of recipes) {
    const existing = await prisma.recipe.findUnique({
      where: { slug: recipe.slug },
    });

    if (!existing) {
      await prisma.recipe.create({
        data: recipe as any,
      });
      console.log(`✓ Created recipe: ${recipe.title}`);
    } else {
      await prisma.recipe.update({
        where: { slug: recipe.slug },
        data: { published: true, approved: true },
      });
      console.log(`✓ Updated recipe: ${recipe.title}`);
    }
  }

  console.log("✅ Seeding complete!");
}

seedApprovedRecipes()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
