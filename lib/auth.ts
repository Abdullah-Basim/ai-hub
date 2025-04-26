import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { cache } from "react"
import { redirect } from "next/navigation"

// Create a cached version of getSession to avoid multiple calls
export const getSession = cache(async () => {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
})

// Get the current user
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

// Check if the user is authenticated, redirect if not
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

// Check if the user is authenticated, return boolean
export async function isAuthenticated() {
  const session = await getSession()
  return !!session
}
