import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface JsonRecipe {
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  cuisine: string;
  category: string;
  mealCourse: string;
  country: string;
  instructions: string;
  categories: string[];
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  spiceLevel?: number;
  dietType?: string;
  emotionTags?: string[];
  origin?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Starting database seed from JSON file...");

  // Get JSON file path from command line argument or use default
  const jsonFilePath = process.argv[2];

  if (!jsonFilePath) {
    console.error("❌ Error: Please provide a JSON file path as argument");
    console.log("Usage: npm run prisma:seed-file <path-to-json-file>");
    console.log(
      "Example: npm run prisma:seed-file src/types/recipe.examples.json"
    );
    process.exit(1);
  }

  // Resolve the path relative to project root
  const jsonPath = path.isAbsolute(jsonFilePath)
    ? jsonFilePath
    : path.join(process.cwd(), jsonFilePath);

  // Check if file exists
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Error: File not found: ${jsonPath}`);
    process.exit(1);
  }

  console.log(`📂 Reading JSON file: ${jsonPath}`);

  // Read the JSON file
  const jsonContent = fs.readFileSync(jsonPath, "utf-8");
  const examples = JSON.parse(jsonContent);

  // Create test users
  const hashedPassword = await hash("password123", 12);

  const chefPriya = await prisma.user.upsert({
    where: { email: "priya@example.com" },
    update: {},
    create: {
      email: "priya@example.com",
      name: "Chef Priya",
      password: hashedPassword,
      bio: "North Indian cuisine specialist with 15 years of experience",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    },
  });

  const chefLakshmi = await prisma.user.upsert({
    where: { email: "lakshmi@example.com" },
    update: {},
    create: {
      email: "lakshmi@example.com",
      name: "Chef Lakshmi",
      password: hashedPassword,
      bio: "Traditional South Indian recipes from my grandmother's kitchen",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
    },
  });

  const chefMaria = await prisma.user.upsert({
    where: { email: "maria@example.com" },
    update: {},
    create: {
      email: "maria@example.com",
      name: "Chef Maria",
      password: hashedPassword,
      bio: "Italian culinary traditions and modern twists",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    },
  });

  const chefArif = await prisma.user.upsert({
    where: { email: "arif@example.com" },
    update: {},
    create: {
      email: "arif@example.com",
      name: "Chef Arif",
      password: hashedPassword,
      bio: "Master of Hyderabadi and Mughlai cuisine",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    },
  });

  console.log("✅ Created users");

  // Create categories
  const categoryMap = new Map<string, string>();
  const categoryNames = [
    "breakfast",
    "lunch",
    "dinner",
    "dessert",
    "appetizers",
    "snacks",
    "beverages",
    "main_course",
  ];

  for (const catName of categoryNames) {
    const category = await prisma.category.upsert({
      where: { slug: catName },
      update: {},
      create: {
        name:
          catName.charAt(0).toUpperCase() + catName.slice(1).replace("_", " "),
        slug: catName,
        description: `${
          catName.charAt(0).toUpperCase() + catName.slice(1)
        } recipes`,
        imageUrl:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
      },
    });
    categoryMap.set(catName, category.id);
  }

  console.log("✅ Created categories");

  // Helper function to create recipe from JSON
  async function createRecipeFromJson(
    recipeData: JsonRecipe,
    userId: string,
    featured: boolean = false
  ) {
    const slug = generateSlug(recipeData.title);

    // Calculate total time
    const totalTime = recipeData.prepTime + recipeData.cookTime;

    // Get category IDs
    const categoryIds = recipeData.categories
      .map((cat) => categoryMap.get(cat))
      .filter((id): id is string => id !== undefined);

    try {
      const recipe = await prisma.recipe.upsert({
        where: { slug },
        update: {},
        create: {
          title: recipeData.title,
          slug,
          description: recipeData.description,
          imageUrl: recipeData.imageUrl,
          prepTime: recipeData.prepTime,
          cookTime: recipeData.cookTime,
          totalTime,
          servings: recipeData.servings,
          difficulty: recipeData.difficulty,
          cuisine: recipeData.cuisine as any,
          category: recipeData.category as any,
          mealCourse: recipeData.mealCourse as any,
          country: recipeData.country as any,
          instructions: recipeData.instructions,
          featured,
          published: true,
          spiceLevel: recipeData.spiceLevel,
          dietType: recipeData.dietType as any,
          emotionTags: recipeData.emotionTags || [],
          origin: recipeData.origin,
          authorId: userId,
          categories: {
            create: categoryIds.map((categoryId) => ({
              categoryId,
            })),
          },
          ingredients: {
            create: recipeData.ingredients.map((ing, index) => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              order: index + 1,
            })),
          },
        },
      });

      console.log(`  ✓ Created recipe: ${recipe.title}`);
      return recipe;
    } catch (error) {
      console.error(`  ✗ Error creating recipe ${recipeData.title}:`, error);
      return null;
    }
  }

  // Create recipes from JSON examples
  console.log("\n📝 Creating recipes from JSON examples...");

  // Italian Pizza
  const pizza = await createRecipeFromJson(
    examples.createRecipeExample,
    chefMaria.id,
    true
  );

  // Butter Chicken
  const butterChicken = await createRecipeFromJson(
    examples.createRecipeIndianExample,
    chefPriya.id,
    true
  );

  // Additional Indian recipes
  const masalaDosa = await createRecipeFromJson(
    {
      title: "Masala Dosa",
      description:
        "Crispy rice and lentil crepe filled with spiced potato mixture",
      imageUrl: "https://images.unsplash.com/photo-1630383249896-424e482df921",
      prepTime: 30,
      cookTime: 20,
      servings: 4,
      difficulty: "MEDIUM",
      cuisine: "SOUTH_INDIAN",
      category: "INDIAN_RECIPES",
      mealCourse: "SOUTH_INDIAN_BREAKFAST",
      country: "INDIA",
      instructions:
        "1. Soak rice and lentils overnight.\n2. Grind to smooth batter and ferment.\n3. Prepare potato filling.\n4. Spread batter on hot griddle.\n5. Add filling and fold.\n6. Serve with sambar and chutney.",
      categories: ["breakfast"],
      ingredients: [
        { name: "Rice", amount: "2", unit: "cups" },
        { name: "Urad dal", amount: "1", unit: "cup" },
        { name: "Potatoes", amount: "4", unit: "medium" },
        { name: "Mustard seeds", amount: "1", unit: "tsp" },
        { name: "Curry leaves", amount: "10", unit: "leaves" },
      ],
      spiceLevel: 3,
      dietType: "VEGETARIAN",
      emotionTags: ["traditional", "satisfying"],
      origin: "Karnataka, India",
    },
    chefLakshmi.id,
    true
  );

  const palakPaneer = await createRecipeFromJson(
    {
      title: "Palak Paneer",
      description: "Cottage cheese cubes in creamy spinach gravy",
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: "EASY",
      cuisine: "NORTH_INDIAN",
      category: "INDIAN_RECIPES",
      mealCourse: "MAIN_COURSE",
      country: "INDIA",
      instructions:
        "1. Blanch and puree spinach.\n2. Sauté onions and spices.\n3. Add spinach puree.\n4. Add paneer cubes and cream.\n5. Simmer and serve.",
      categories: ["dinner", "lunch"],
      ingredients: [
        { name: "Fresh spinach", amount: "500", unit: "g" },
        { name: "Paneer", amount: "250", unit: "g" },
        { name: "Onions", amount: "2", unit: "medium" },
        { name: "Ginger-garlic paste", amount: "1", unit: "tbsp" },
        { name: "Cream", amount: "1/4", unit: "cup" },
      ],
      spiceLevel: 2,
      dietType: "VEGETARIAN",
      emotionTags: ["healthy", "comforting"],
      origin: "Punjab, India",
    },
    chefPriya.id,
    true
  );

  const biryani = await createRecipeFromJson(
    {
      title: "Hyderabadi Biryani",
      description: "Aromatic basmati rice layered with spiced meat",
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8",
      prepTime: 45,
      cookTime: 60,
      servings: 6,
      difficulty: "HARD",
      cuisine: "HYDERABADI",
      category: "INDIAN_RECIPES",
      mealCourse: "MAIN_COURSE",
      country: "INDIA",
      instructions:
        "1. Marinate meat with yogurt and spices.\n2. Parboil rice with whole spices.\n3. Layer meat and rice in pot.\n4. Add saffron milk and ghee.\n5. Cook on dum for 45 minutes.\n6. Serve with raita.",
      categories: ["dinner", "lunch"],
      ingredients: [
        { name: "Basmati rice", amount: "3", unit: "cups" },
        { name: "Chicken/Mutton", amount: "1", unit: "kg" },
        { name: "Yogurt", amount: "1", unit: "cup" },
        { name: "Onions", amount: "3", unit: "large" },
        { name: "Saffron", amount: "1", unit: "pinch" },
        { name: "Ghee", amount: "1/2", unit: "cup" },
      ],
      spiceLevel: 4,
      dietType: "NON_VEGETARIAN",
      emotionTags: ["festive", "celebratory"],
      origin: "Hyderabad, India",
    },
    chefArif.id,
    true
  );

  const choleBhature = await createRecipeFromJson(
    {
      title: "Chole Bhature",
      description: "Spicy chickpea curry served with fluffy fried bread",
      imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be",
      prepTime: 30,
      cookTime: 45,
      servings: 4,
      difficulty: "MEDIUM",
      cuisine: "PUNJABI",
      category: "INDIAN_RECIPES",
      mealCourse: "LUNCH",
      country: "INDIA",
      instructions:
        "1. Soak chickpeas overnight and pressure cook.\n2. Prepare masala with onions, tomatoes, and spices.\n3. Add chickpeas and simmer.\n4. Make dough for bhature.\n5. Roll and deep fry bhature.\n6. Serve hot with pickles and onions.",
      categories: ["lunch", "breakfast"],
      ingredients: [
        { name: "Chickpeas", amount: "2", unit: "cups" },
        { name: "All-purpose flour", amount: "3", unit: "cups" },
        { name: "Yogurt", amount: "1/2", unit: "cup" },
        { name: "Onions", amount: "2", unit: "large" },
        { name: "Tomatoes", amount: "3", unit: "medium" },
        { name: "Chole masala", amount: "2", unit: "tbsp" },
      ],
      spiceLevel: 4,
      dietType: "VEGETARIAN",
      emotionTags: ["indulgent", "street-food"],
      origin: "Punjab, India",
    },
    chefPriya.id,
    false
  );

  // Add reviews
  const users = [chefPriya, chefLakshmi, chefMaria, chefArif];
  const recipes = [
    pizza,
    butterChicken,
    masalaDosa,
    palakPaneer,
    biryani,
    choleBhature,
  ].filter((r) => r !== null);

  console.log("\n💬 Creating reviews...");

  const reviewComments = [
    "Absolutely delicious! Followed the recipe exactly and it turned out perfect.",
    "Great recipe! My family loved it. Will make it again.",
    "Simple and tasty. The instructions were very clear.",
    "Amazing flavors! This is now my go-to recipe.",
    "Excellent! The spice level was just right.",
  ];

  for (const recipe of recipes) {
    if (recipe) {
      // Add 2-3 reviews per recipe
      const numReviews = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < numReviews; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomComment =
          reviewComments[Math.floor(Math.random() * reviewComments.length)];
        const randomRating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars

        try {
          await prisma.review.create({
            data: {
              rating: randomRating,
              comment: randomComment,
              userId: randomUser.id,
              recipeId: recipe.id,
            },
          });
        } catch (error) {
          // Skip if review already exists
        }
      }
    }
  }

  console.log("✅ Created reviews");

  // Update recipe statistics
  console.log("\n📊 Updating recipe statistics...");
  for (const recipe of recipes) {
    if (recipe) {
      const views = Math.floor(Math.random() * 3000) + 500;
      const likes = Math.floor(Math.random() * 200) + 20;
      const saves = Math.floor(Math.random() * 100) + 10;

      await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          views,
          likes,
          saves,
          pageVisits: views,
        },
      });
    }
  }

  console.log("✅ Updated statistics");
  console.log("\n🎉 Database seeded successfully from JSON file!");
  console.log(`📝 Created ${recipes.length} recipes`);
  console.log(`👥 Created ${users.length} users`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
