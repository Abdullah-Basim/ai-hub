import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { modelId, input, output } = await request.json()

    // Save the prompt
    const prompt = await prisma.prompt.create({
      data: {
        userId: session.user.id,
        modelId,
        input,
        output,
      },
    })

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error("Error saving prompt:", error)
    return NextResponse.json({ error: "Failed to save prompt" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Get the user's prompts
    const prompts = await prisma.prompt.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        model: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip,
    })

    const total = await prisma.prompt.count({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      prompts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching prompts:", error)
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
  }
}
