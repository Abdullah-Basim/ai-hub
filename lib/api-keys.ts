import { nanoid } from "nanoid"
import { prisma } from "./prisma"

// Generate a secure API key
export function generateApiKey(): string {
  return `sk_${nanoid(32)}`
}

// Create a new API key for a user
export async function createApiKey(userId: string, name: string, permissions: string[] = []) {
  const key = generateApiKey()

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name,
      key,
      permissions,
      isActive: true,
    },
  })

  // Return the full key only once - after this, only the masked version will be available
  return {
    ...apiKey,
    key,
  }
}

// Get all API keys for a user (with masked keys)
export async function getUserApiKeys(userId: string) {
  const apiKeys = await prisma.apiKey.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Mask the keys for security
  return apiKeys.map((key) => ({
    ...key,
    key: maskApiKey(key.key),
  }))
}

// Mask an API key for display
export function maskApiKey(key: string): string {
  if (!key) return ""

  const prefix = key.substring(0, 5)
  const suffix = key.substring(key.length - 4)

  return `${prefix}...${suffix}`
}

// Validate an API key
export async function validateApiKey(key: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: {
      key,
    },
    include: {
      user: true,
    },
  })

  if (!apiKey || !apiKey.isActive) {
    return { valid: false }
  }

  // Check if the key is expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false }
  }

  return {
    valid: true,
    userId: apiKey.userId,
    permissions: apiKey.permissions,
    user: apiKey.user,
  }
}

// Revoke an API key
export async function revokeApiKey(id: string, userId: string) {
  return prisma.apiKey.updateMany({
    where: {
      id,
      userId, // Ensure the key belongs to the user
    },
    data: {
      isActive: false,
    },
  })
}
