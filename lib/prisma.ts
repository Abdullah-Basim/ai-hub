import { PrismaClient } from "@prisma/client"
import { env } from "./env"

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    // Connection pooling configuration
    // Recommended settings for serverless environments
    connectionLimit: {
      min: 1,
      max: 10,
    },
  })

// Ensure the Prisma Client is only created once in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Helper function to test database connection
export async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { success: true }
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}
