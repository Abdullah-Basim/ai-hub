import { prisma } from "./prisma"
import { neon } from "@neondatabase/serverless"
import * as env from "./env"

// Create a SQL client using Neon's serverless driver
export const sql = env.DATABASE_URL ? neon(env.DATABASE_URL) : null

// Export the Prisma client
export { prisma }

// Function to test database connection
export async function testConnection() {
  try {
    // Test Prisma connection
    await prisma.$queryRaw`SELECT 1`
    console.log("Prisma connection successful")
    return true
  } catch (error) {
    console.error("Database connection error:", error)
    return false
  }
}
