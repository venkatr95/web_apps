# Frontend Setup Guide

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

Application will start at: http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

- Vite config: `vite.config.ts`
- TypeScript config: `tsconfig.json`
- API proxy configured to forward `/api/*` to `http://localhost:8000`

## Project Structure

```
src/
├── components/       # React components
├── api/             # API client functions
├── types/           # TypeScript interfaces
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Development Notes

- Backend must be running on port 8000
- Hot reload enabled for instant updates
- TypeScript strict mode enabled
