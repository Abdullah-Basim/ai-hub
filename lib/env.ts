// Environment variable configuration with validation

// Define the structure of our environment variables
export interface EnvVariables {
  // Database
  DATABASE_URL: string
  POSTGRES_URL_NON_POOLING: string

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_JWT_SECRET: string

  // File Storage
  BLOB_READ_WRITE_TOKEN: string

  // Deployment
  NEXT_PUBLIC_VERCEL_URL: string
}

// Helper function to get environment variables with validation
function getEnvVar(key: string, required = false): string {
  // Check for prefixed version first (e.g., APP_DATABASE_URL)
  const prefixedKey = `APP_${key}`
  const value = process.env[prefixedKey] || process.env[key] || ""

  if (required && !value) {
    // In development, warn about missing variables
    if (process.env.NODE_ENV === "development") {
      console.warn(`Missing required environment variable: ${key}`)
    }
    // In production, throw an error for missing required variables
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }

  return value
}

// Export all environment variables
export const env: EnvVariables = {
  // Database
  DATABASE_URL: getEnvVar("DATABASE_URL", true),
  POSTGRES_URL_NON_POOLING: getEnvVar("POSTGRES_URL_NON_POOLING", true),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: getEnvVar("NEXT_PUBLIC_SUPABASE_URL", true),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", true),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar("SUPABASE_SERVICE_ROLE_KEY", true),
  SUPABASE_JWT_SECRET: getEnvVar("SUPABASE_JWT_SECRET", true),

  // File Storage
  BLOB_READ_WRITE_TOKEN: getEnvVar("BLOB_READ_WRITE_TOKEN", true),

  // Deployment
  NEXT_PUBLIC_VERCEL_URL: getEnvVar("NEXT_PUBLIC_VERCEL_URL", false) || "localhost:3000",
}

// Validate required environment variables
export function validateEnvVars(): { valid: boolean; missing: string[] } {
  const requiredVars = [
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]

  const missing = requiredVars.filter((key) => !getEnvVar(key))

  return {
    valid: missing.length === 0,
    missing,
  }
}
