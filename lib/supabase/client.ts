import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { env } from "../env"
import type { Database } from "./database.types"

// Create a singleton instance of the Supabase client for client components
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>({
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      },
    })
  }
  return supabaseClient
}
