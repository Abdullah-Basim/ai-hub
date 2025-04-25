import { prisma } from "./prisma"
import { neon } from "@neondatabase/serverless"

// Create a SQL client using Neon's serverless driver
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

export { prisma }
