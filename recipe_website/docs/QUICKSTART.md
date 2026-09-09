# Quick Start Guide - RecipeHub

## 🚀 Local Development Setup

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:

- Next.js 15+
- React 19
- Prisma
- NextAuth
- Tailwind CSS
- Testing libraries

### Step 2: Database Setup

**Option A: Local PostgreSQL**

1. Install PostgreSQL on your machine
2. Create a database:
   ```sql
   CREATE DATABASE recipe_db;
   ```
3. Update `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/recipe_db"
   ```

**Option B: Cloud PostgreSQL (Recommended for Development)**

Use one of these free options:

- **Supabase**: https://supabase.com (Free tier: 500MB)
- **Neon**: https://neon.tech (Free tier: 10GB)
- **Railway**: https://railway.app (Free trial)

Get your connection string and add to `.env`

### Step 3: Environment Variables

Create `.env` file in the root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Optional: OAuth Providers
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### Step 4: Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed with sample data
npm run prisma:seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

**Test Credentials:**

- Email: chef@example.com
- Password: password123

## 🧪 Testing

### Run All Tests

```bash
# Unit tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

### Run Specific Tests

```bash
# Watch mode for unit tests
npm run test:watch

# Specific E2E test
npx playwright test tests/e2e/recipe.spec.ts
```

## 🚢 Production Deployment

### Deploy to Vercel (Recommended)

**Prerequisites:**

- GitHub account
- Vercel account (free)
- Production database (Supabase, Neon, or Railway)

**Steps:**

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**

   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**

   In Vercel Dashboard → Settings → Environment Variables, add:

   ```
   DATABASE_URL = postgresql://your-production-db-url
   NEXTAUTH_URL = https://your-domain.vercel.app
   NEXTAUTH_SECRET = your-production-secret
   ```

4. **Deploy**

   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Future pushes to `main` auto-deploy

5. **Run Database Migrations**

   After first deployment:

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login
   vercel login

   # Run migrations on production
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

### Manual Deployment (Alternative)

**Build for Production:**

```bash
npm run build
npm start
```

**Required Environment Variables:**

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
NODE_ENV="production"
```

## 🗄️ Database Management

### View Database

```bash
npm run prisma:studio
```

Opens GUI at http://localhost:5555

### Create Migration

```bash
# After changing schema.prisma
npx prisma migrate dev --name migration_name
```

### Reset Database

```bash
# ⚠️ Deletes all data
npx prisma migrate reset
```

### Backup Database

```bash
# PostgreSQL backup
pg_dump -U username -d recipe_db > backup.sql

# Restore
psql -U username -d recipe_db < backup.sql
```

## 🐛 Troubleshooting

### Common Issues

**1. Prisma Client Not Generated**

```bash
npm run prisma:generate
```

**2. Migration Fails**

```bash
# Check database connection
npx prisma db pull

# Reset and try again
npx prisma migrate reset
```

**3. TypeScript Errors**

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**4. NextAuth Session Issues**

```bash
# Clear browser cookies for localhost
# Regenerate NEXTAUTH_SECRET
openssl rand -base64 32
```

**5. Port Already in Use**

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

## 📊 Monitoring & Analytics

### Add Vercel Analytics

```bash
npm install @vercel/analytics
```

In `src/app/layout.tsx`:

```tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Add Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

Follow Sentry Next.js setup wizard:

```bash
npx @sentry/wizard@latest -i nextjs
```

## 🔧 Advanced Configuration

### Custom Domain (Vercel)

1. Go to Vercel Dashboard → Domains
2. Add your domain
3. Update DNS records with your provider
4. Update `NEXTAUTH_URL` in environment variables

### Enable OAuth Providers

**Google OAuth:**

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect: `https://yourdomain.com/api/auth/callback/google`
4. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
5. Update `src/lib/auth.ts` to include GoogleProvider

**GitHub OAuth:**

1. Go to GitHub Settings → Developer settings
2. Create OAuth App
3. Add callback URL: `https://yourdomain.com/api/auth/callback/github`
4. Add to `.env`:
   ```env
   GITHUB_ID="your-client-id"
   GITHUB_SECRET="your-client-secret"
   ```

### Image Upload (Cloudinary)

1. Sign up at https://cloudinary.com
2. Get credentials from dashboard
3. Add to `.env`:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```
4. Implement upload API route (see documentation)

## 📈 Performance Optimization

### Analyze Bundle Size

```bash
# Install analyzer
npm install @next/bundle-analyzer

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

# Run analysis
ANALYZE=true npm run build
```

### Enable Caching

Production is automatically optimized. For development:

```typescript
// In API routes
export const revalidate = 3600; // ISR: 1 hour

// In Server Components
export const dynamic = "force-static";
```

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 💬 Support

- Create an issue on GitHub
- Check existing issues and discussions
- Read the documentation

---

**Happy Cooking! 🍳**
