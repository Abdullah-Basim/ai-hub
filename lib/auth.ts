import { createServerSupabaseClient } from "./supabase/server"
import { cache } from "react"
import { redirect } from "next/navigation"

// Create a cached version of getSession to avoid multiple calls
export const getSession = cache(async () => {
  const supabase = createServerSupabaseClient()
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
export async function requireAuth(redirectTo = "/login") {
  const session = await getSession()

  if (!session) {
    redirect(redirectTo)
  }

  return session
}

// Check if the user is authenticated, return boolean
export async function isAuthenticated() {
  const session = await getSession()
  return !!session
}

// Get user with profile data from database
export async function getUserWithProfile() {
  const session = await getSession()

  if (!session) {
    return null
  }

  // Import here to avoid circular dependencies
  const { prisma } = await import("./prisma")

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })

    return {
      ...session.user,
      profile: user,
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return {
      ...session.user,
      profile: null,
    }
  }
}
