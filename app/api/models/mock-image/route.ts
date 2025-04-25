import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prompt, modelId, style, dimensions } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Get the model from the database
    const model = await prisma.model.findUnique({
      where: {
        id: modelId,
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

    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a unique filename for the generated image
    const filename = `${nanoid()}.png`
    const pathname = `generated/${user.id}/${filename}`

    // For demo purposes, we'll use a placeholder image
    const placeholderUrl = `https://placehold.co/512x512/random/png?text=${encodeURIComponent(prompt.substring(0, 20))}`

    // Fetch the placeholder image
    const imageResponse = await fetch(placeholderUrl)
    const imageBlob = await imageResponse.blob()

    // Upload to Vercel Blob
    const { url } = await put(pathname, imageBlob, {
      access: "public",
      addRandomSuffix: false,
    })

    // Save file metadata to database
    const fileRecord = await prisma.file.create({
      data: {
        userId: user.id,
        type: "image",
        storagePath: pathname,
        filename: `${model.name} - ${new Date().toLocaleDateString()}`,
        size: imageBlob.size,
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

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
        output: url,
      },
    })

    return NextResponse.json({ imageUrl: url, file: fileRecord })
  } catch (error) {
    console.error("Error generating mock image:", error)
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
