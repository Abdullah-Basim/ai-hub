import { PrismaClient } from "@prisma/client"

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Use environment variables for database connection
const databaseUrl = process.env.DATABASE_URL || process.env.aihub_DATABASE_URL

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
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
