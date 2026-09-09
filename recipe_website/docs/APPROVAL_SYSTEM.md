# Recipe Approval System

## Overview

The recipe approval system allows administrators to review and approve user-submitted recipes before they are published on the platform.

## Features

### For Regular Users

- ✅ Create recipes (automatically **unpublished** and **pending approval**)
- ✅ Edit their own recipes
- ✅ View their pending recipes
- ✅ Receive notifications when recipes are approved/rejected

### For Admins

- ✅ Edit **any** recipe
- ✅ View all pending recipes
- ✅ Approve recipes (publishes them)
- ✅ Reject recipes with reason
- ✅ Auto-publish their own recipes

## Database Schema Changes

### Recipe Model

```prisma
model Recipe {
  // ... other fields
  published  Boolean @default(false)  // Changed from true to false
  approved   Boolean @default(false)  // New field
  // ... other fields
}
```

## API Endpoints

### 1. Create Recipe

**POST** `/api/recipes`

- Regular users: Recipe created as `published: false, approved: false`
- Admins: Recipe created as `published: true, approved: true`

```typescript
// Response
{
  "recipe": { ... },
  "message": "Recipe created successfully. Pending admin approval." // For users
}
```

### 2. Edit Recipe

**PUT** `/api/recipes/{slug}`

**Permissions:**

- Regular users: Can only edit their own recipes
- Admins: Can edit any recipe

```typescript
// Request
{
  "title": "Updated Title",
  "description": "Updated description",
  // ... other fields
}
```

### 3. Approve Recipe (Admin only)

**POST** `/api/recipes/{slug}/approve`

**Authorization:** Admin only

```typescript
// Response
{
  "recipe": { ... },
  "message": "Recipe approved and published successfully"
}
```

### 4. Reject Recipe (Admin only)

**DELETE** `/api/recipes/{slug}/approve`

**Authorization:** Admin only

```typescript
// Request
{
  "reason": "Recipe does not meet quality standards"
}

// Response
{
  "recipe": { ... },
  "message": "Recipe rejected successfully"
}
```

### 5. Get Pending Recipes (Admin only)

**GET** `/api/admin/pending-recipes`

**Authorization:** Admin only

```typescript
// Response
{
  "recipes": [
    {
      "id": "...",
      "title": "...",
      "author": { ... },
      "createdAt": "...",
      // ... other fields
    }
  ],
  "total": 5
}
```

## Migration Steps

### 1. Update Database Schema

```bash
# Create migration
npx prisma migrate dev --name add_recipe_approval

# Or apply manually
npx prisma db execute --stdin < prisma/migrations/add_recipe_approval/migration.sql
```

### 2. Verify Changes

```bash
# Open Prisma Studio
npm run prisma:studio

# Check Recipe table for new 'approved' column
```

### 3. Update Existing Data

All existing recipes will be automatically marked as `approved: true` and `published: true` by the migration.

## User Flows

### Regular User Creates Recipe

1. User submits recipe via `/recipes/new`
2. Recipe saved with `published: false, approved: false`
3. User sees "Recipe submitted for approval" message
4. Recipe appears in user's "Pending Recipes" section
5. Admin reviews and approves/rejects
6. User receives notification

### Admin Creates Recipe

1. Admin submits recipe via `/recipes/new`
2. Recipe saved with `published: true, approved: true`
3. Recipe immediately visible on platform
4. No approval needed

### Admin Approval Workflow

1. Admin navigates to `/admin/pending-recipes`
2. Reviews recipe details
3. Clicks "Approve" or "Reject"
4. If approved: Recipe becomes public
5. If rejected: User notified with reason

## Frontend Implementation

### Check User Permissions

```typescript
import { useSession } from "next-auth/react";

function RecipeEditButton({ recipe }: { recipe: Recipe }) {
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner = session?.user?.id === recipe.authorId;
  const canEdit = isAdmin || isOwner;

  if (!canEdit) return null;

  return <Button href={`/recipes/${recipe.slug}/edit`}>Edit</Button>;
}
```

### Approve Recipe (Admin)

```typescript
async function approveRecipe(recipeSlug: string) {
  const response = await fetch(`/api/recipes/${recipeSlug}/approve`, {
    method: "POST",
  });

  if (response.ok) {
    alert("Recipe approved!");
    router.refresh();
  }
}
```

### Reject Recipe (Admin)

```typescript
async function rejectRecipe(recipeSlug: string, reason: string) {
  const response = await fetch(`/api/recipes/${recipeSlug}/approve`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });

  if (response.ok) {
    alert("Recipe rejected");
    router.refresh();
  }
}
```

## Recipe Visibility Rules

### Public Recipes Page

```typescript
// Only show approved and published recipes
where: {
  approved: true,
  published: true
}
```

### User's Own Recipes

```typescript
// Show all user's recipes (pending, approved, rejected)
where: {
  authorId: userId;
}
```

### Admin Pending Queue

```typescript
// Show all pending recipes
where: {
  approved: false,
  published: false
}
```

## Notifications

### Approval Notification

```
Subject: Your recipe has been approved!
Body: Congratulations! Your recipe "{title}" has been approved and is now live.
```

### Rejection Notification

```
Subject: Recipe submission update
Body: Your recipe "{title}" requires some changes. Reason: {reason}
```

## Testing

### Test as Regular User

1. Sign in as regular user
2. Create a recipe
3. Verify recipe is NOT visible on public pages
4. Check "My Recipes" shows "Pending" status

### Test as Admin

1. Sign in as admin
2. Create a recipe - should be immediately public
3. Go to `/admin/pending-recipes`
4. Approve/reject user recipes
5. Edit any recipe (yours or others)

## Security Considerations

- ✅ All admin endpoints check for `role === "ADMIN"`
- ✅ Regular users cannot access admin endpoints (403 Forbidden)
- ✅ Users can only edit their own recipes (unless admin)
- ✅ Recipe visibility filtered by approval status
- ✅ Session validation on all protected routes

## Future Enhancements

- [ ] Email notifications for approvals/rejections
- [ ] Admin dashboard with pending count badge
- [ ] Revision history for rejected recipes
- [ ] Bulk approve/reject functionality
- [ ] Recipe quality scoring system
- [ ] Auto-approval for trusted users

## Admin UI

### Accessing the Admin Panel

Admin users can access the pending recipes queue via:

- **URL**: `/admin/pending-recipes`
- **Navigation**: User menu dropdown → "🛡️ Admin Panel" (visible only to admins)

### Features

- **Recipe Cards**: Each pending recipe is displayed with:

  - Recipe image and title
  - Description preview
  - Cooking time and servings
  - Author information
  - Submission date
  - Approve/Reject/View actions

- **Approve Action**: One-click approval that publishes the recipe immediately
- **Reject Dialog**: Opens a modal to provide rejection reason to the author
- **View Recipe**: Link to view the full recipe details

### Files Created

- `src/app/[locale]/admin/pending-recipes/page.tsx` - Admin page (server component)
- `src/components/admin/PendingRecipeCard.tsx` - Recipe card with approve/reject actions (client component)
- Translation keys added to all language files (`messages/*.json`) under `admin.pendingRecipes`

### Translations

The admin UI is fully internationalized with support for all 7 languages:

- English (en)
- German (de)
- Spanish (es)
- Hindi (hi)
- Kannada (kn)
- Tamil (ta)
- Telugu (te)
