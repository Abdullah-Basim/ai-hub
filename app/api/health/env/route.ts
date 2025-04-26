import { NextResponse } from "next/server"
import { validateEnvVars } from "@/lib/env"

export async function GET() {
  try {
    const { valid, missing } = validateEnvVars()

    return NextResponse.json({
      status: valid ? "ok" : "warning",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envStatus: {
        valid,
        missing: missing.length > 0 ? missing : undefined,
      },
    })
  } catch (error) {
    console.error("Environment variables health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error checking environment variables",
      },
      { status: 500 },
    )
  }
}
