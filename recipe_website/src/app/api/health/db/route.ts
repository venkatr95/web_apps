import { verifyDatabaseConnection } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("\n[Health Check] Database health check requested");

  const result = await verifyDatabaseConnection();

  if (result.connected) {
    console.log("[Health Check] ✅ Database is healthy\n");
    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  console.log("[Health Check] ❌ Database is unhealthy\n");
  return NextResponse.json(
    {
      status: "unhealthy",
      database: "disconnected",
      error: result.error,
      details: result.details,
      timestamp: new Date().toISOString(),
    },
    { status: 503 }
  );
}
