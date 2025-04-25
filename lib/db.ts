import { PrismaClient } from "@prisma/client"
import { neon } from "@neondatabase/serverless"

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Create a SQL client using Neon's serverless driver
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null
