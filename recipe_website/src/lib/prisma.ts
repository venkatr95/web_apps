import { PrismaClient } from "@prisma/client";
import { isDemoMode } from "./demo";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// In demo mode, create a Prisma client but it won't be used for actual queries
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Check if database is available
export async function isDatabaseAvailable(): Promise<boolean> {
  if (isDemoMode()) return false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    console.warn("Database not available, falling back to demo mode");
    return false;
  }
}

// Verify database connection with detailed logging
export async function verifyDatabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
  details?: Record<string, unknown>;
}> {
  if (isDemoMode()) {
    return {
      connected: false,
      error: "Running in demo mode - database not used",
    };
  }

  const databaseUrl = process.env.DATABASE_URL;

  console.log("[DB] Checking database connection...");
  console.log("[DB] Database URL configured:", databaseUrl ? "Yes" : "No");

  if (!databaseUrl || databaseUrl === "demo") {
    console.error("[DB] DATABASE_URL is not configured or set to 'demo'");
    return {
      connected: false,
      error: "DATABASE_URL environment variable is not configured",
    };
  }

  // Extract connection details (safely)
  try {
    const url = new URL(databaseUrl);
    console.log("[DB] Connection details:", {
      host: url.hostname,
      port: url.port,
      database: url.pathname.slice(1),
      user: url.username,
    });
  } catch (e) {
    console.error("[DB] Invalid DATABASE_URL format", e);
  }

  try {
    console.log("[DB] Attempting to connect to database...");
    await prisma.$connect();
    console.log("[DB] Successfully connected to Prisma Client");

    console.log("[DB] Running test query...");
    await prisma.$queryRaw`SELECT 1 as result`;
    console.log("[DB] ✅ Database connection verified successfully");

    return { connected: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[DB] ❌ Database connection failed:", errorMessage);
    console.error("[DB] Full error:", error);

    return {
      connected: false,
      error: errorMessage,
      details: {
        name: error instanceof Error ? error.name : "Unknown",
        stack: error instanceof Error ? error.stack : undefined,
      },
    };
  }
}
