import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
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

    const { prompt, modelId } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Get the model from the database
    const model = await prisma.model.findFirst({
      where: {
        modelId: "gemini-pro",
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const genModel = genAI.getGenerativeModel({ model: "gemini-pro" })

    const result = await genModel.generateContent(prompt)
    const response = result.response
    const text = response.text()

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
    console.error("Error calling Gemini API:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
