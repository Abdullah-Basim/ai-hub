import { prisma } from "./prisma"
import { neon } from "@neondatabase/serverless"

// Create a SQL client using Neon's serverless driver
const databaseUrl = process.env.DATABASE_URL || process.env.aihub_DATABASE_URL
export const sql = databaseUrl ? neon(databaseUrl) : null

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
