import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { Groq } from "groq-sdk"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { modelId, prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!modelId) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 })
    }

    // Get the model from the database
    const model = await prisma.model.findFirst({
      where: {
        modelId: modelId,
        provider: "Groq",
      },
    })

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
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

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    })

    // Call the Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: modelId,
    })

    const text = completion.choices[0]?.message?.content || ""

    // Update usage count for premium models
    if (model.tier !== "free") {
      await prisma.modelUsage.upsert({
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
    }

    // Save the prompt and response
    await prisma.prompt.create({
      data: {
        userId: user.id,
        modelId: model.id,
        input: prompt,
        output: text,
      },
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error calling Groq API:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
