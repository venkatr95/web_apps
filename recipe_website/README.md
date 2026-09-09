# RecipeHub - Modern Recipe Sharing Platform

A production-quality, full-stack recipe website built with Next.js 15+, TypeScript, Prisma, PostgreSQL, and NextAuth. Inspired by cookaifood.com, featuring server-side rendering, authentication, and comprehensive testing.

## 🚀 Features

- **Modern Stack**: Next.js 15+ App Router, TypeScript, Tailwind CSS
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js with credentials and OAuth support
- **Performance**: SSR, SSG, and ISR for optimal performance
- **Responsive Design**: Mobile-first, fully responsive UI
- **SEO Optimized**: Dynamic metadata, OpenGraph tags, structured data
- **Testing**: Unit tests (Jest) and E2E tests (Playwright)
- **Accessibility**: WCAG compliant, semantic HTML

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

## 🛠️ Installation

### Quick Start (Demo Mode)

Want to try RecipeHub without any setup? Just run:

```bash
git clone <repository-url>
cd recipe_website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and explore with demo data! Login with:

- **Email**: demo@example.com
- **Password**: (any password works)

### Full Setup (With Database)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd recipe_website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/recipe_db?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key-here"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # Seed the database with sample data
   npm run prisma:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎭 Demo Mode

RecipeHub automatically runs in **Demo Mode** when no database is configured. This allows you to:

- ✅ Browse 3 demo recipes (Pizza, Butter Chicken, Chocolate Chip Cookies)
- ✅ Login with `demo@example.com` (any password)
- ✅ Test all features (favorites, collections, shopping lists)
- ✅ Experience the full UI without database setup

**Demo Mode Features:**

- All data is static and in-memory
- Mutations (create/update/delete) return success but don't persist
- Perfect for quick testing, demos, or development without a database
- Blue banner notification indicates demo mode (dismissible)

**To Enable Demo Mode:**

- Don't create a `.env` file, OR
- Set `DATABASE_URL="demo"` in your `.env` file

**To Exit Demo Mode:**

- Configure a valid `DATABASE_URL` in `.env` and restart the app

## 🏗️ Project Structure

```
recipe_website/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts             # Seed data
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   ├── recipes/       # Recipe pages
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Homepage
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── Navigation.tsx
│   │   └── RecipeCard.tsx
│   ├── lib/              # Utility functions
│   │   ├── prisma.ts    # Prisma client
│   │   ├── auth.ts      # NextAuth configuration
│   │   ├── utils.ts     # Helper functions
│   │   └── validations.ts # Zod schemas
│   └── types/           # TypeScript types
├── tests/
│   └── e2e/            # Playwright E2E tests
├── public/             # Static assets
└── package.json
```

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## 📊 Database Management

```bash
# Open Prisma Studio (database GUI)
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add environment variables**

   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_URL`: Your production URL
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

4. **Deploy**
   - Vercel will automatically deploy on push to main branch

### PostgreSQL Database Options

- **Vercel Postgres**: Built-in Vercel solution
- **Supabase**: Free tier with PostgreSQL
- **Railway**: Easy PostgreSQL hosting
- **Neon**: Serverless PostgreSQL

## 🔧 Configuration

### NextAuth

Add OAuth providers in `src/lib/auth.ts`:

```typescript
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
];
```

### Image Upload

For production, integrate with Cloudinary or similar:

1. Set environment variables:

   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

2. Implement upload API route in `src/app/api/upload/route.ts`

## 📝 Features Overview

### User Features

- ✅ User registration and authentication
- ✅ Profile management
- ✅ Recipe creation and editing
- ✅ Recipe reviews and ratings
- ✅ Favorite recipes
- ✅ Search and filter recipes

### Recipe Features

- ✅ Recipe categories
- ✅ Ingredient lists
- ✅ Step-by-step instructions
- ✅ Prep and cook time
- ✅ Servings and difficulty level
- ✅ Nutrition information
- ✅ Recipe images

### Technical Features

- ✅ Server-side rendering (SSR)
- ✅ Static site generation (SSG)
- ✅ Incremental static regeneration (ISR)
- ✅ Optimistic UI updates
- ✅ Form validation with Zod
- ✅ Type-safe database queries
- ✅ Responsive images with Next.js Image

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Theme**: Primary and secondary color schemes
- **Typography**: Inter for body, Playfair Display for headings
- **Responsive**: Mobile-first design with breakpoints

## 📚 API Routes

- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth authentication
- `GET /api/recipes` - List recipes (with filters)
- `GET /api/recipes/[id]` - Get recipe details
- `POST /api/recipes` - Create recipe (protected)
- `PUT /api/recipes/[id]` - Update recipe (protected)
- `DELETE /api/recipes/[id]` - Delete recipe (protected)
- `POST /api/reviews` - Add review (protected)

## 🔒 Security

- Password hashing with bcrypt
- JWT-based sessions
- CSRF protection
- Input validation with Zod
- SQL injection prevention (Prisma)
- XSS protection

## 🚀 Performance Optimizations

- Image optimization with Next.js Image
- Code splitting and lazy loading
- Server Components by default
- Edge runtime for API routes
- Database query optimization with Prisma
- Caching strategies (ISR, SWR)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Inspired by [cookaifood.com](https://cookaifood.com/recipes)
- Built with [Next.js](https://nextjs.org/)
- Database with [Prisma](https://www.prisma.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For support, email support@recipehub.com or open an issue on GitHub.

---

**Happy Cooking! 🍳**
