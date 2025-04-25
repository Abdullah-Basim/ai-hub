import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { modelId } = await request.json()

    // Get the user's current plan
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the model
    const model = await prisma.model.findUnique({
      where: {
        id: modelId,
      },
    })

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Check if the user has reached the free usage limit for premium models
    if (model.tier !== "free" && user.plan === "free") {
      const usage = await prisma.modelUsage.findUnique({
        where: {
          userId_modelId: {
            userId: user.id,
            modelId: model.id,
          },
        },
      })

      if (usage && usage.count >= 3) {
        return NextResponse.json({ error: "Free usage limit reached" }, { status: 403 })
      }
    }

    // Update or create usage record
    const usage = await prisma.modelUsage.upsert({
      where: {
        userId_modelId: {
          userId: user.id,
          modelId: model.id,
        },
      },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        userId: user.id,
        modelId: model.id,
        count: 1,
      },
    })

    return NextResponse.json({ usage })
  } catch (error) {
    console.error("Error tracking model usage:", error)
    return NextResponse.json({ error: "Failed to track model usage" }, { status: 500 })
  }
}
