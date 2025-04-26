import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { put } from "@vercel/blob"
import { nanoid } from "nanoid"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the file from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Generate a unique filename
    const extension = file.name.split(".").pop() || ""
    const uniqueFilename = `${nanoid()}.${extension}`
    const pathname = `uploads/${session.user.id}/${uniqueFilename}`

    // Upload to Vercel Blob
    const { url } = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
    })

    // Save file metadata to database
    const fileRecord = await prisma.file.create({
      data: {
        userId: session.user.id,
        name: file.name,
        key: pathname,
        url,
        size: file.size,
        type: file.type,
        status: "ready",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    // Track usage
    await prisma.usageRecord.create({
      data: {
        userId: session.user.id,
        service: "storage",
        operation: "upload",
        resourceId: fileRecord.id,
        units: Math.ceil(file.size / 1024), // Convert to KB
        cost: 0, // Free for now
        statusCode: 200,
      },
    })

    return NextResponse.json({ url, file: fileRecord })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 },
    )
  }
}
