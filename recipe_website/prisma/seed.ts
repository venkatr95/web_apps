import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create test user
  const hashedPassword = await hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "chef@example.com" },
    update: {},
    create: {
      email: "chef@example.com",
      name: "Chef John",
      password: hashedPassword,
      bio: "Passionate home cook sharing delicious recipes",
    },
  });

  console.log("✅ Created user:", user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "breakfast" },
      update: {},
      create: {
        name: "Breakfast",
        slug: "breakfast",
        description: "Start your day right",
        imageUrl:
          "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800",
      },
    }),
    prisma.category.upsert({
      where: { slug: "lunch" },
      update: {},
      create: {
        name: "Lunch",
        slug: "lunch",
        description: "Midday meals",
        imageUrl:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
      },
    }),
    prisma.category.upsert({
      where: { slug: "dinner" },
      update: {},
      create: {
        name: "Dinner",
        slug: "dinner",
        description: "Evening delights",
        imageUrl:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
      },
    }),
    prisma.category.upsert({
      where: { slug: "dessert" },
      update: {},
      create: {
        name: "Dessert",
        slug: "dessert",
        description: "Sweet treats",
        imageUrl:
          "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
      },
    }),
    prisma.category.upsert({
      where: { slug: "appetizers" },
      update: {},
      create: {
        name: "Appetizers",
        slug: "appetizers",
        description: "Start your meal",
        imageUrl:
          "https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=800",
      },
    }),
  ]);

  console.log("✅ Created categories:", categories.length);

  // Create sample recipes
  const recipe1 = await prisma.recipe.upsert({
    where: { slug: "classic-spaghetti-carbonara" },
    update: {},
    create: {
      title: "Classic Spaghetti Carbonara",
      slug: "classic-spaghetti-carbonara",
      description:
        "Authentic Italian carbonara with eggs, pecorino cheese, guanciale, and black pepper",
      imageUrl:
        "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=1200",
      prepTime: 10,
      cookTime: 20,
      totalTime: 30,
      servings: 4,
      difficulty: "MEDIUM",
      cuisine: "ITALIAN",
      category: "INDIAN_RECIPES",
      mealCourse: "MAIN_COURSE",
      country: "ITALY",
      featured: true,
      instructions: `1. Bring a large pot of salted water to boil for the pasta.
2. Cut guanciale into small strips and cook in a pan until crispy.
3. Beat eggs with grated Pecorino Romano cheese in a bowl.
4. Cook spaghetti according to package directions until al dente.
5. Reserve 1 cup of pasta water, then drain the spaghetti.
6. Remove guanciale pan from heat and add hot pasta.
7. Pour egg mixture over pasta, tossing quickly. Add pasta water to create a creamy sauce.
8. Season with black pepper and serve immediately with extra cheese.`,
      authorId: user.id,
      categories: {
        create: [
          { categoryId: categories.find((c) => c.slug === "dinner")!.id },
        ],
      },
      ingredients: {
        create: [
          { name: "Spaghetti", amount: "400", unit: "g", order: 1 },
          { name: "Guanciale", amount: "200", unit: "g", order: 2 },
          { name: "Pecorino Romano", amount: "100", unit: "g", order: 3 },
          { name: "Egg yolks", amount: "4", unit: "large", order: 4 },
          { name: "Black pepper", amount: "1", unit: "tsp", order: 5 },
          { name: "Salt", amount: "to taste", unit: "", order: 6 },
        ],
      },
      nutritionInfo: {
        create: {
          calories: 650,
          protein: 28.5,
          carbohydrates: 75.0,
          fat: 25.0,
          fiber: 3.0,
          sugar: 2.5,
          sodium: 850.0,
        },
      },
    },
  });

  const recipe2 = await prisma.recipe.upsert({
    where: { slug: "blueberry-pancakes" },
    update: {},
    create: {
      title: "Fluffy Blueberry Pancakes",
      slug: "blueberry-pancakes",
      description: "Light and fluffy pancakes loaded with fresh blueberries",
      imageUrl:
        "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=1200",
      prepTime: 10,
      cookTime: 15,
      totalTime: 25,
      servings: 4,
      difficulty: "EASY",
      cuisine: "AMERICAN",
      category: "WORLD_RECIPES",
      mealCourse: "WORLD_BREAKFAST",
      country: "UNITED_STATES",
      featured: true,
      instructions: `1. Mix flour, sugar, baking powder, and salt in a large bowl.
2. In another bowl, whisk together milk, egg, melted butter, and vanilla.
3. Pour wet ingredients into dry ingredients and mix until just combined (lumps are okay).
4. Gently fold in fresh blueberries.
5. Heat a griddle or pan over medium heat and lightly grease.
6. Pour 1/4 cup batter for each pancake.
7. Cook until bubbles form on surface, then flip and cook until golden.
8. Serve warm with maple syrup and extra blueberries.`,
      authorId: user.id,
      categories: {
        create: [
          { categoryId: categories.find((c) => c.slug === "breakfast")!.id },
        ],
      },
      ingredients: {
        create: [
          { name: "All-purpose flour", amount: "2", unit: "cups", order: 1 },
          { name: "Sugar", amount: "2", unit: "tbsp", order: 2 },
          { name: "Baking powder", amount: "2", unit: "tsp", order: 3 },
          { name: "Salt", amount: "1/2", unit: "tsp", order: 4 },
          { name: "Milk", amount: "1 3/4", unit: "cups", order: 5 },
          { name: "Egg", amount: "1", unit: "large", order: 6 },
          { name: "Butter, melted", amount: "3", unit: "tbsp", order: 7 },
          { name: "Vanilla extract", amount: "1", unit: "tsp", order: 8 },
          { name: "Fresh blueberries", amount: "1", unit: "cup", order: 9 },
        ],
      },
      nutritionInfo: {
        create: {
          calories: 320,
          protein: 9.0,
          carbohydrates: 52.0,
          fat: 8.5,
          fiber: 2.5,
          sugar: 12.0,
          sodium: 450.0,
        },
      },
    },
  });

  const recipe3 = await prisma.recipe.upsert({
    where: { slug: "chocolate-lava-cake" },
    update: {},
    create: {
      title: "Chocolate Lava Cake",
      slug: "chocolate-lava-cake",
      description: "Decadent molten chocolate cake with a gooey center",
      imageUrl:
        "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=1200",
      prepTime: 15,
      cookTime: 12,
      totalTime: 27,
      servings: 4,
      difficulty: "MEDIUM",
      cuisine: "FRENCH",
      category: "DESSERT_RECIPES",
      mealCourse: "DESSERT",
      country: "FRANCE",
      featured: true,
      instructions: `1. Preheat oven to 425°F (220°C). Butter and flour four ramekins.
2. Melt chocolate and butter together in a double boiler.
3. In a bowl, beat eggs and sugar until thick and pale.
4. Fold melted chocolate mixture into eggs.
5. Sift in flour and fold gently until combined.
6. Divide batter among prepared ramekins.
7. Bake for 12-14 minutes until edges are firm but center is soft.
8. Let stand for 1 minute, then invert onto plates. Serve immediately with ice cream.`,
      authorId: user.id,
      categories: {
        create: [
          { categoryId: categories.find((c) => c.slug === "dessert")!.id },
        ],
      },
      ingredients: {
        create: [
          { name: "Dark chocolate", amount: "4", unit: "oz", order: 1 },
          { name: "Butter", amount: "1/2", unit: "cup", order: 2 },
          { name: "Eggs", amount: "2", unit: "large", order: 3 },
          { name: "Egg yolks", amount: "2", unit: "large", order: 4 },
          { name: "Sugar", amount: "1/4", unit: "cup", order: 5 },
          { name: "All-purpose flour", amount: "2", unit: "tbsp", order: 6 },
          { name: "Vanilla extract", amount: "1", unit: "tsp", order: 7 },
        ],
      },
      nutritionInfo: {
        create: {
          calories: 420,
          protein: 7.5,
          carbohydrates: 35.0,
          fat: 28.0,
          fiber: 3.0,
          sugar: 25.0,
          sodium: 180.0,
        },
      },
    },
  });

  // Create Indian recipes
  const recipe4 = await prisma.recipe.upsert({
    where: { slug: "butter-chicken-murgh-makhani" },
    update: {},
    create: {
      title: "Butter Chicken (Murgh Makhani)",
      slug: "butter-chicken-murgh-makhani",
      description:
        "Tender chicken pieces cooked in a rich, creamy tomato-based sauce with aromatic spices. This beloved North Indian dish is perfect with naan or basmati rice.",
      imageUrl:
        "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=1200",
      prepTime: 30,
      cookTime: 45,
      totalTime: 75,
      servings: 6,
      difficulty: "MEDIUM",
      cuisine: "NORTH_INDIAN",
      category: "INDIAN_RECIPES",
      mealCourse: "MAIN_COURSE",
      country: "INDIA",
      featured: true,
      spiceLevel: 3,
      dietType: "NON_VEGETARIAN",
      emotionTags: ["indulgent", "comforting", "festive"],
      origin: "Punjab, India",
      instructions: `1. Marinate chicken pieces in yogurt, lemon juice, ginger-garlic paste, and spices for 2 hours.
2. Grill or pan-fry the marinated chicken until charred and cooked through. Set aside.
3. In a large pan, heat butter and sauté onions until golden.
4. Add ginger-garlic paste and cook for 2 minutes.
5. Add tomato puree, red chili powder, and cook until oil separates.
6. Add garam masala, kasuri methi, and salt.
7. Pour in heavy cream and mix well.
8. Add the cooked chicken and simmer for 10 minutes.
9. Garnish with cream and fresh coriander.
10. Serve hot with naan or rice.`,
      authorId: user.id,
      categories: {
        create: [
          { categoryId: categories.find((c) => c.slug === "dinner")!.id },
          { categoryId: categories.find((c) => c.slug === "lunch")!.id },
        ],
      },
      ingredients: {
        create: [
          { name: "Chicken breast", amount: "2", unit: "lbs", order: 1 },
          { name: "Yogurt", amount: "1/2", unit: "cup", order: 2 },
          {
            name: "Ginger-garlic paste",
            amount: "2",
            unit: "tbsp",
            order: 3,
          },
          { name: "Tomato puree", amount: "2", unit: "cups", order: 4 },
          { name: "Heavy cream", amount: "1", unit: "cup", order: 5 },
          { name: "Butter", amount: "4", unit: "tbsp", order: 6 },
          { name: "Garam masala", amount: "1", unit: "tbsp", order: 7 },
          { name: "Kasuri methi", amount: "1", unit: "tsp", order: 8 },
          { name: "Red chili powder", amount: "1", unit: "tsp", order: 9 },
        ],
      },
      nutritionInfo: {
        create: {
          calories: 485,
          protein: 35.0,
          carbohydrates: 18.0,
          fat: 32.0,
          fiber: 3.5,
          sugar: 8.0,
          sodium: 680.0,
        },
      },
    },
  });

  const recipe5 = await prisma.recipe.upsert({
    where: { slug: "masala-dosa" },
    update: {},
    create: {
      title: "Masala Dosa",
      slug: "masala-dosa",
      description:
        "Crispy rice and lentil crepe filled with spiced potato mixture, served with sambar and chutney",
      imageUrl:
        "https://images.unsplash.com/photo-1630383249896-424e482df921?w=1200",
      prepTime: 30,
      cookTime: 20,
      totalTime: 50,
      servings: 4,
      difficulty: "MEDIUM",
      cuisine: "SOUTH_INDIAN",
      category: "INDIAN_RECIPES",
      mealCourse: "SOUTH_INDIAN_BREAKFAST",
      country: "INDIA",
      featured: true,
      spiceLevel: 3,
      dietType: "VEGETARIAN",
      emotionTags: ["traditional", "satisfying", "energizing"],
      origin: "Karnataka, India",
      mealTypeTimeRangeStart: "07:00",
      mealTypeTimeRangeEnd: "11:00",
      instructions: `1. Soak rice and lentils overnight.
2. Grind to a smooth batter and ferment for 8-12 hours.
3. Prepare potato filling with onions, mustard seeds, and spices.
4. Heat a griddle and spread the batter thinly.
5. Cook until crispy, add filling, and fold.
6. Serve hot with sambar and coconut chutney.`,
      authorId: user.id,
      categories: {
        create: [
          { categoryId: categories.find((c) => c.slug === "breakfast")!.id },
        ],
      },
      ingredients: {
        create: [
          { name: "Rice", amount: "2", unit: "cups", order: 1 },
          { name: "Urad dal", amount: "1", unit: "cup", order: 2 },
          { name: "Potatoes", amount: "4", unit: "medium", order: 3 },
          { name: "Mustard seeds", amount: "1", unit: "tsp", order: 4 },
          { name: "Curry leaves", amount: "10", unit: "leaves", order: 5 },
          { name: "Turmeric powder", amount: "1/2", unit: "tsp", order: 6 },
          { name: "Green chilies", amount: "2", unit: "medium", order: 7 },
          { name: "Onions", amount: "1", unit: "large", order: 8 },
        ],
      },
      nutritionInfo: {
        create: {
          calories: 320,
          protein: 8.0,
          carbohydrates: 58.0,
          fat: 6.0,
          fiber: 4.0,
          sugar: 3.0,
          sodium: 280.0,
        },
      },
    },
  });

  const recipe6 = await prisma.recipe.upsert({
    where: { slug: "palak-paneer" },
    update: {},
    create: {
      title: "Palak Paneer",
      slug: "palak-paneer",
      description:
        "Cottage cheese cubes in a creamy spinach gravy with aromatic Indian spices",
      imageUrl:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200",
      prepTime: 15,
      cookTime: 25,
      totalTime: 40,
      servings: 4,
      difficulty: "EASY",
      cuisine: "NORTH_INDIAN",
      category: "INDIAN_RECIPES",
      mealCourse: "MAIN_COURSE",
      country: "INDIA",
      featured: true,
      spiceLevel: 2,
      dietType: "VEGETARIAN",
      emotionTags: ["healthy", "comforting", "nutritious"],
      origin: "Punjab, India",
      instructions: `1. Blanch spinach leaves in boiling water for 2 minutes, then puree.
2. Heat oil and sauté cumin seeds, onions, ginger-garlic paste.
3. Add tomatoes and cook until soft.
4. Add spices: turmeric, coriander, garam masala.
5. Pour in spinach puree and cook for 5 minutes.
6. Add paneer cubes and cream.
7. Simmer for 5 minutes until flavors blend.
8. Garnish with cream and serve with naan or rice.`,
      authorId: user.id,
      categories: {
        create: [
          { categoryId: categories.find((c) => c.slug === "dinner")!.id },
          { categoryId: categories.find((c) => c.slug === "lunch")!.id },
        ],
      },
      ingredients: {
        create: [
          { name: "Fresh spinach", amount: "500", unit: "g", order: 1 },
          { name: "Paneer", amount: "250", unit: "g", order: 2 },
          { name: "Onions", amount: "2", unit: "medium", order: 3 },
          { name: "Tomatoes", amount: "2", unit: "medium", order: 4 },
          {
            name: "Ginger-garlic paste",
            amount: "1",
            unit: "tbsp",
            order: 5,
          },
          { name: "Cream", amount: "1/4", unit: "cup", order: 6 },
          { name: "Garam masala", amount: "1", unit: "tsp", order: 7 },
          { name: "Cumin seeds", amount: "1", unit: "tsp", order: 8 },
        ],
      },
      nutritionInfo: {
        create: {
          calories: 285,
          protein: 14.0,
          carbohydrates: 18.0,
          fat: 18.0,
          fiber: 5.0,
          sugar: 6.0,
          sodium: 420.0,
        },
      },
    },
  });

  const recipe7 = await prisma.recipe.upsert({
    where: { slug: "hyderabadi-biryani" },
    update: {},
    create: {
      title: "Hyderabadi Biryani",
      slug: "hyderabadi-biryani",
      description:
        "Aromatic basmati rice layered with spiced meat, saffron, and herbs, cooked to perfection",
      imageUrl:
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200",
      prepTime: 45,
      cookTime: 60,
      totalTime: 105,
      servings: 6,
      difficulty: "HARD",
      cuisine: "HYDERABADI",
      category: "INDIAN_RECIPES",
      mealCourse: "MAIN_COURSE",
      country: "INDIA",
      featured: true,
      spiceLevel: 4,
      dietType: "NON_VEGETARIAN",
      emotionTags: ["festive", "royal", "celebratory"],
      origin: "Hyderabad, India",
      instructions: `1. Marinate chicken or mutton with yogurt, spices, and herbs for 2 hours.
2. Parboil basmati rice with whole spices until 70% cooked.
3. In a heavy-bottomed pot, layer marinated meat at the bottom.
4. Add fried onions, mint, and coriander leaves.
5. Layer parboiled rice on top.
6. Sprinkle saffron milk and ghee over rice.
7. Cover tightly with foil and lid.
8. Cook on dum (low heat) for 40-45 minutes.
9. Let rest for 5 minutes before serving.
10. Garnish with boiled eggs, fried onions, and fresh herbs.`,
      authorId: user.id,
      categories: {
        create: [
          { categoryId: categories.find((c) => c.slug === "dinner")!.id },
          { categoryId: categories.find((c) => c.slug === "lunch")!.id },
        ],
      },
      ingredients: {
        create: [
          { name: "Basmati rice", amount: "3", unit: "cups", order: 1 },
          { name: "Chicken/Mutton", amount: "1", unit: "kg", order: 2 },
          { name: "Yogurt", amount: "1", unit: "cup", order: 3 },
          { name: "Onions", amount: "3", unit: "large", order: 4 },
          { name: "Mint leaves", amount: "1/2", unit: "cup", order: 5 },
          { name: "Coriander leaves", amount: "1/2", unit: "cup", order: 6 },
          { name: "Saffron", amount: "1", unit: "pinch", order: 7 },
          { name: "Ghee", amount: "1/2", unit: "cup", order: 8 },
          { name: "Biryani masala", amount: "3", unit: "tbsp", order: 9 },
          { name: "Ginger-garlic paste", amount: "3", unit: "tbsp", order: 10 },
        ],
      },
      nutritionInfo: {
        create: {
          calories: 620,
          protein: 32.0,
          carbohydrates: 68.0,
          fat: 24.0,
          fiber: 3.0,
          sugar: 4.0,
          sodium: 720.0,
        },
      },
    },
  });

  // Create reviews for new recipes
  await prisma.review.create({
    data: {
      rating: 5,
      comment:
        "Absolutely delicious! The best carbonara I've ever made at home.",
      userId: user.id,
      recipeId: recipe1.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment:
        "The butter chicken turned out amazing! Restaurant quality at home.",
      userId: user.id,
      recipeId: recipe4.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: "Crispy dosas just like my grandmother used to make. Loved it!",
      userId: user.id,
      recipeId: recipe5.id,
    },
  });

  console.log("✅ Created 7 recipes and reviews");
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
