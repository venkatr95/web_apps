# Database Seeding Guide

This guide explains how to populate your RecipeHub database with recipe data.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Seeding Methods](#seeding-methods)
- [Method 1: Default Seed Script](#method-1-default-seed-script)
- [Method 2: JSON File Import](#method-2-json-file-import)
- [JSON File Format](#json-file-format)
- [Single Recipe Example](#single-recipe-example)
- [Bulk Import Example](#bulk-import-example)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. Database connection configured in `.env`
2. Prisma migrations applied: `npm run prisma:migrate`
3. Node.js and dependencies installed

## Seeding Methods

### Method 1: Default Seed Script

Use the default seed script to populate the database with pre-defined sample recipes (Italian, Indian, and more).

```bash
npm run prisma:seed
```

**What it does:**

- Creates test users (Chef John, Chef Priya, etc.)
- Creates recipe categories (breakfast, lunch, dinner, dessert, etc.)
- Adds 7 sample recipes with ingredients and nutrition info
- Generates reviews and ratings
- Sets up realistic view/like/save statistics

### Method 2: JSON File Import

Import recipes from a custom JSON file with full control over the data.

```bash
npm run prisma:seed-file <path-to-json-file>
```

**Examples:**

```bash
# Import from the example file
npm run prisma:seed-file src/types/recipe.examples.json

# Import from a custom file
npm run prisma:seed-file data/my-recipes.json

# Import from an absolute path
npm run prisma:seed-file C:/Users/YourName/recipes.json
```

## JSON File Format

Your JSON file should contain recipe objects following the `CreateRecipeDTO` format. See `src/types/recipe.examples.json` for complete examples.

### Single Recipe Example

Create a file `my-recipe.json`:

```json
{
  "createRecipeExample": {
    "title": "Classic Margherita Pizza",
    "description": "A traditional Italian pizza with fresh tomatoes, mozzarella, and basil.",
    "imageUrl": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
    "prepTime": 20,
    "cookTime": 15,
    "servings": 4,
    "difficulty": "MEDIUM",
    "cuisine": "ITALIAN",
    "category": "WORLD_RECIPES",
    "mealCourse": "DINNER",
    "country": "ITALY",
    "instructions": "1. Preheat oven to 475°F.\n2. Roll out pizza dough.\n3. Add sauce and toppings.\n4. Bake for 12-15 minutes.\n5. Serve hot with fresh basil.",
    "categories": ["dinner", "lunch"],
    "ingredients": [
      {
        "name": "Pizza dough",
        "amount": "1",
        "unit": "ball"
      },
      {
        "name": "Tomato sauce",
        "amount": "1/2",
        "unit": "cup"
      },
      {
        "name": "Fresh mozzarella",
        "amount": "8",
        "unit": "oz"
      },
      {
        "name": "Fresh basil leaves",
        "amount": "1/4",
        "unit": "cup"
      }
    ],
    "spiceLevel": 1,
    "dietType": "VEGETARIAN",
    "emotionTags": ["comforting", "classic"],
    "origin": "Naples, Italy"
  }
}
```

Then import it:

```bash
npm run prisma:seed-file my-recipe.json
```

### Bulk Import Example

Create a file `bulk-recipes.json` with multiple recipes:

```json
{
  "butterChicken": {
    "title": "Butter Chicken",
    "description": "Creamy North Indian chicken curry",
    "imageUrl": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
    "prepTime": 30,
    "cookTime": 45,
    "servings": 6,
    "difficulty": "MEDIUM",
    "cuisine": "NORTH_INDIAN",
    "category": "INDIAN_RECIPES",
    "mealCourse": "MAIN_COURSE",
    "country": "INDIA",
    "instructions": "1. Marinate chicken...\n2. Cook sauce...\n3. Combine and simmer...",
    "categories": ["dinner", "lunch"],
    "ingredients": [
      { "name": "Chicken breast", "amount": "2", "unit": "lbs" },
      { "name": "Yogurt", "amount": "1/2", "unit": "cup" },
      { "name": "Tomato puree", "amount": "2", "unit": "cups" }
    ],
    "spiceLevel": 3,
    "dietType": "NON_VEGETARIAN"
  },
  "masalaDosa": {
    "title": "Masala Dosa",
    "description": "Crispy South Indian rice crepe with potato filling",
    "imageUrl": "https://images.unsplash.com/photo-1630383249896-424e482df921",
    "prepTime": 30,
    "cookTime": 20,
    "servings": 4,
    "difficulty": "MEDIUM",
    "cuisine": "SOUTH_INDIAN",
    "category": "INDIAN_RECIPES",
    "mealCourse": "SOUTH_INDIAN_BREAKFAST",
    "country": "INDIA",
    "instructions": "1. Soak and grind batter...\n2. Ferment overnight...\n3. Make potato filling...",
    "categories": ["breakfast"],
    "ingredients": [
      { "name": "Rice", "amount": "2", "unit": "cups" },
      { "name": "Urad dal", "amount": "1", "unit": "cup" },
      { "name": "Potatoes", "amount": "4", "unit": "medium" }
    ],
    "spiceLevel": 3,
    "dietType": "VEGETARIAN"
  }
}
```

Import all recipes:

```bash
npm run prisma:seed-file bulk-recipes.json
```

## Required Fields

When creating recipes, ensure these fields are included:

### Mandatory Fields

- `title` (string, 5-100 chars)
- `description` (string, 20-500 chars)
- `imageUrl` (valid URL)
- `prepTime` (number, minutes)
- `cookTime` (number, minutes)
- `servings` (number, min 1)
- `difficulty` ("EASY" | "MEDIUM" | "HARD")
- `cuisine` (see CuisineType enum in schema.prisma)
- `category` (see RecipeCategoryType enum in schema.prisma)
- `mealCourse` (see MealCourse enum in schema.prisma)
- `country` (see Country enum in schema.prisma)
- `instructions` (string, min 50 chars)
- `categories` (array of category slugs)
- `ingredients` (array with name, amount, unit)

### Optional Fields

- `spiceLevel` (number, 1-5)
- `dietType` (see DietType enum in schema.prisma)
- `emotionTags` (array of strings)
- `origin` (string)
- `mealTypeTimeRangeStart` (string, HH:MM format)
- `mealTypeTimeRangeEnd` (string, HH:MM format)

## Available Enums

### Difficulty

```
EASY, MEDIUM, HARD
```

### DietType

```
VEGETARIAN, VEGAN, NON_VEGETARIAN, EGGETARIAN, PESCATARIAN,
GLUTEN_FREE, DAIRY_FREE, KETO, PALEO, LOW_CARB, HIGH_PROTEIN
```

### CuisineType (Popular)

```
INDIAN, NORTH_INDIAN, SOUTH_INDIAN, ITALIAN, CHINESE, MEXICAN,
THAI, FRENCH, MEDITERRANEAN, JAPANESE, KOREAN, etc.
```

### MealCourse

```
APPETIZER, DESSERT, ONE_POT_DISH, SOUTH_INDIAN_BREAKFAST,
SIDE_DISH, LUNCH, MAIN_COURSE, WORLD_BREAKFAST, BRUNCH,
NORTH_INDIAN_BREAKFAST, INDIAN_BREAKFAST, SNACK, DINNER
```

### Country

```
INDIA, ITALY, CHINA, MEXICO, FRANCE, THAILAND, JAPAN,
KOREA, UNITED_STATES, UNITED_KINGDOM, etc.
```

## Script Features

The `seed_file.ts` script automatically:

1. ✅ Creates test users with hashed passwords
2. ✅ Creates all necessary categories
3. ✅ Validates recipe data against schema
4. ✅ Generates unique slugs for recipes
5. ✅ Calculates total time (prepTime + cookTime)
6. ✅ Links recipes to categories
7. ✅ Creates ingredients with proper ordering
8. ✅ Adds random reviews and ratings (4-5 stars)
9. ✅ Sets realistic statistics (views, likes, saves)
10. ✅ Handles duplicate recipes (upsert logic)

## Troubleshooting

### Error: File not found

```bash
❌ Error: File not found: path/to/file.json
```

**Solution:** Check the file path. Use relative path from project root or absolute path.

### Error: Invalid JSON

```bash
❌ Error seeding database: SyntaxError: Unexpected token
```

**Solution:** Validate your JSON file at [jsonlint.com](https://jsonlint.com/)

### Error: Validation failed

```bash
❌ Error creating recipe: Validation error
```

**Solution:** Ensure all required fields are present and enum values match schema.

### Error: Duplicate recipe

The script uses `upsert`, so duplicate recipes (same slug) will be updated, not cause errors.

## Viewing Data

After seeding, view your data:

```bash
# Open Prisma Studio
npm run prisma:studio
```

Or query the database:

```bash
# Count recipes
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM Recipe;"

# List recipe titles
npx prisma db execute --stdin <<< "SELECT title, cuisine, difficulty FROM Recipe;"
```

## Resetting Database

To clear all data and start fresh:

```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Then seed again
npm run prisma:seed
# or
npm run prisma:seed-file your-recipes.json
```

## Tips

1. **Start with examples:** Use `src/types/recipe.examples.json` as a template
2. **Test one recipe first:** Create a small JSON with one recipe to test
3. **Use valid URLs:** Ensure imageUrl points to accessible images
4. **Check enums:** Verify cuisine, country, and category values match schema
5. **Validate ingredients:** Each ingredient needs name, amount, and unit
6. **Format instructions:** Use `\n` for line breaks in instructions

## Support

For enum values and detailed schema information, check:

- `prisma/schema.prisma` - Full database schema
- `src/types/recipe.dto.ts` - TypeScript DTOs
- `src/types/recipe.examples.json` - Working examples

## Example Commands Summary

```bash
# Default seeding (7 recipes)
npm run prisma:seed

# Import from example file
npm run prisma:seed-file src/types/recipe.examples.json

# Import custom recipes
npm run prisma:seed-file my-recipes.json

# View database
npm run prisma:studio

# Reset and reseed
npx prisma migrate reset && npm run prisma:seed
```
