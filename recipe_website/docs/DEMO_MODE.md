# Demo Mode Documentation

## Overview

RecipeHub includes a comprehensive **Demo Mode** that allows the application to run without any database or environment configuration. This is perfect for:

- Quick testing and demos
- Development without database setup
- Trying out the application before committing to infrastructure
- CI/CD preview environments

## How Demo Mode Works

### Automatic Detection

Demo mode is automatically enabled when:

1. No `.env` file exists, OR
2. `DATABASE_URL` is missing or set to `"demo"` in `.env`

### Demo Data

When in demo mode, the application provides:

#### Demo User

- **Email**: demo@example.com
- **Password**: Any password (authentication always succeeds)
- **Name**: Demo User
- **Bio**: Exploring RecipeHub in demo mode

#### Demo Recipes (3 recipes)

1. **Classic Margherita Pizza**
   - Italian cuisine
   - 30 min prep, 15 min cook
   - Includes full ingredients, nutrition info, and reviews
2. **Spicy Butter Chicken**
   - Indian cuisine
   - 20 min prep, 30 min cook
   - Complete with ingredients, nutrition, and reviews
3. **Chocolate Chip Cookies**
   - American dessert
   - 15 min prep, 12 min cook
   - Full ingredient list, nutrition data, and reviews

#### Demo Data Includes:

- ✅ Full recipe details (title, description, images, times, servings)
- ✅ Complete ingredient lists with amounts and units
- ✅ Nutritional information (calories, protein, carbs, fat, fiber, sugar, sodium)
- ✅ User reviews with ratings (4-5 stars)
- ✅ Categories and cuisines
- ✅ Cooking instructions
- ✅ Recipe metadata (difficulty, dietary info)

## Features Supported in Demo Mode

### Browse & Search

- ✅ View all demo recipes on homepage
- ✅ View recipe details
- ✅ Browse by category
- ✅ Search and filter recipes

### Authentication

- ✅ Login with demo@example.com
- ✅ Session management
- ✅ Protected routes work normally

### User Actions (Non-Persistent)

All these features work and return success, but changes are NOT saved:

- ✅ Add/remove favorites
- ✅ Create collections
- ✅ Add recipes to collections
- ✅ Create shopping lists
- ✅ Add comments to recipes
- ✅ Add recipe reviews
- ✅ Follow/unfollow users (demo data)

### Visual Feedback

- 🔵 Blue banner notification at top of page
- 💡 "Demo Mode" message with explanation
- 🗙 Dismissible (saved to localStorage)
- ℹ️ API responses include `_demoMode: true` flag

## Implementation Details

### Core Files

#### `src/lib/demo.ts`

- Demo mode detection logic
- Static demo data (users, recipes, ingredients, nutrition)
- Helper functions: `isDemoMode()`, `getDemoUser()`, `getDemoRecipes()`, `getDemoRecipe(slug)`

#### `src/lib/demoApi.ts`

- API wrapper for demo operations
- `withDemoMode()` - wraps API calls with demo fallback
- Demo handlers for all major operations
- Consistent response format with `_demoMode` flag

#### `src/components/DemoBanner.tsx`

- Client-side banner component
- Auto-detects demo mode via API calls
- Dismissible with localStorage persistence
- Styled with gradient and info icon

### API Routes with Demo Support

All major API routes include demo mode handling:

1. **Recipes** (`/api/recipes`)

   - GET: Returns filtered/paginated demo recipes
   - POST: Returns success (not persisted)

2. **Favorites** (`/api/favorites`)

   - GET: Returns demo favorites (first 2 recipes)
   - POST: Create favorite (not persisted)
   - DELETE: Remove favorite (not persisted)

3. **Collections** (`/api/collections`)

   - GET: Returns demo collections
   - POST: Create collection (not persisted)

4. **Shopping Lists** (`/api/shopping-lists`)

   - GET: Returns demo shopping list with ingredients
   - POST: Create shopping list (not persisted)

5. **Comments** (`/api/comments`)
   - POST: Create comment (not persisted)

### Database Fallback

Files updated with demo fallback:

- **`src/lib/prisma.ts`**

  - Checks demo mode before database operations
  - `isDatabaseAvailable()` async function
  - Graceful error handling

- **`src/lib/auth.ts`**

  - Accepts demo@example.com in any environment
  - Returns demo user on authentication
  - Skips PrismaAdapter in demo mode

- **`src/app/page.tsx`**

  - Homepage checks demo mode first
  - Try-catch fallback to demo data

- **`src/app/recipes/[slug]/page.tsx`**
  - Recipe detail page checks demo mode
  - Falls back to demo recipe on errors

## Usage Examples

### Enable Demo Mode

**Option 1: No configuration (easiest)**

```bash
# Just run without .env file
npm install
npm run dev
```

**Option 2: Explicit demo mode**

```bash
# Create .env with demo flag
echo 'DATABASE_URL="demo"' > .env
npm run dev
```

### Disable Demo Mode

Configure a real database:

```bash
# Edit .env
DATABASE_URL="postgresql://user:password@localhost:5432/recipe_db?schema=public"

# Restart the app
npm run dev
```

## Testing Demo Mode

### Manual Test Checklist

1. **No Database**

   - [ ] Remove/rename `.env` file
   - [ ] Run `npm run dev`
   - [ ] App starts without errors
   - [ ] Demo banner appears

2. **Homepage**

   - [ ] 3 demo recipes display
   - [ ] Recipe cards show correct data
   - [ ] Categories work

3. **Authentication**

   - [ ] Login with demo@example.com (any password)
   - [ ] Session created successfully
   - [ ] Protected pages accessible

4. **Recipe Details**

   - [ ] Click on a recipe
   - [ ] Full details load (ingredients, nutrition, reviews)
   - [ ] Instructions display correctly

5. **User Actions**

   - [ ] Add to favorites → Success message
   - [ ] Create collection → Success message
   - [ ] Add comment → Success message
   - [ ] Create shopping list → Success message

6. **Demo Banner**
   - [ ] Banner visible on all pages
   - [ ] Click dismiss → Banner hides
   - [ ] Refresh page → Banner stays hidden
   - [ ] Clear localStorage → Banner reappears

## Development Notes

### Adding New Demo Data

To add more demo recipes, edit `src/lib/demo.ts`:

```typescript
export const DEMO_RECIPES = [
  // ... existing recipes
  {
    id: "demo-recipe-4",
    title: "New Demo Recipe",
    slug: "new-demo-recipe",
    // ... full recipe data
  },
];
```

### Adding Demo Support to New API Routes

Pattern to follow:

```typescript
import { isDemoMode } from "@/lib/demo";

export async function POST(request: Request) {
  // ... auth checks

  if (isDemoMode()) {
    return NextResponse.json({
      // return demo data
      _demoMode: true,
      _message: "Demo mode: Action not persisted",
    });
  }

  // ... normal database operations
}
```

## Limitations

Demo mode has some intentional limitations:

- ❌ No data persistence (all changes lost on refresh)
- ❌ Limited to 3 recipes (can be extended)
- ❌ Single demo user
- ❌ No image uploads
- ❌ No real email sending
- ❌ No external API integrations

These limitations are by design to keep demo mode lightweight and fast.

## Benefits

✅ **Zero Configuration**: Works out of the box
✅ **Fast Setup**: No database installation required
✅ **Safe Testing**: No risk of corrupting production data
✅ **Portable**: Easy to share and demo
✅ **Development**: Great for frontend development without backend
✅ **CI/CD**: Perfect for preview environments

## Production Considerations

⚠️ **Important**: Demo mode is intended for development and testing only. For production deployments:

1. Always configure a real database
2. Set proper `NEXTAUTH_SECRET`
3. Configure OAuth providers if needed
4. Set up proper email service
5. Configure production-grade storage for images

The application will automatically exit demo mode when a valid database is configured.
