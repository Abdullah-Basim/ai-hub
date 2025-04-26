import { PrismaClient } from "@prisma/client"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Running database migrations...")
    await execAsync("npx prisma migrate dev --name init")

    console.log("Seeding database...")
    await execAsync("npx prisma db seed")

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
