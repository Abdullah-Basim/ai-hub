import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/prisma"
import { validateEnvVars } from "@/lib/env"

export async function GET() {
  try {
    // Check database connection
    const dbStatus = await testDatabaseConnection()

    // Check environment variables
    const envStatus = validateEnvVars()

    return NextResponse.json({
      status: dbStatus.success && envStatus.valid ? "ok" : "warning",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connected: dbStatus.success,
        error: dbStatus.success ? undefined : dbStatus.error,
      },
      env: {
        valid: envStatus.valid,
        missing: envStatus.missing.length > 0 ? envStatus.missing : undefined,
      },
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
