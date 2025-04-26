import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { env } from "../env"
import type { Database } from "./database.types"

// Create a Supabase client for server components
export function createServerSupabaseClient() {
  return createServerComponentClient<Database>({
    cookies,
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}

// Create a Supabase admin client for server operations that require elevated privileges
export function createServerSupabaseAdmin() {
  return createServerComponentClient<Database>({
    cookies,
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: env.SUPABASE_SERVICE_ROLE_KEY,
  })
}
