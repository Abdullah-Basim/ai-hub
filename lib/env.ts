// Environment variable configuration

// Helper function to get environment variables with fallbacks
function getEnvVar(key: string, fallback = ""): string {
  // Check for prefixed version first (e.g., aihub_DATABASE_URL)
  const prefixedKey = `aihub_${key}`

  if (process.env[prefixedKey]) {
    return process.env[prefixedKey] || fallback
  }

  // Fall back to non-prefixed version
  return process.env[key] || fallback
}

// Database configuration
export const DATABASE_URL = getEnvVar("POSTGRES_URL")
export const POSTGRES_URL_NON_POOLING = getEnvVar("POSTGRES_URL_NON_POOLING")

// Supabase configuration
export const NEXT_PUBLIC_SUPABASE_URL = getEnvVar("NEXT_PUBLIC_SUPABASE_URL")
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")
export const SUPABASE_SERVICE_ROLE_KEY = getEnvVar("SUPABASE_SERVICE_ROLE_KEY")

// AI Model API Keys
export const GEMINI_API_KEY = getEnvVar("GEMINI_API_KEY")
export const GROQ_API_KEY = getEnvVar("GROQ_API_KEY")

// Vercel Blob
export const BLOB_READ_WRITE_TOKEN = getEnvVar("BLOB_READ_WRITE_TOKEN")

// Deployment
export const NEXT_PUBLIC_VERCEL_URL = getEnvVar("NEXT_PUBLIC_VERCEL_URL", "localhost:3000")

// Validate required environment variables
export function validateEnvVars(): { valid: boolean; missing: string[] } {
  const requiredVars = [
    "POSTGRES_URL",
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
