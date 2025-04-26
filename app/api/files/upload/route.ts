import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { put } from "@vercel/blob"
import { nanoid } from "nanoid"
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

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are supported" }, { status: 400 })
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Generate a unique filename
    const extension = file.name.split(".").pop()
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
        type: file.type.split("/")[0], // e.g., "image" from "image/png"
        storagePath: pathname,
        filename: file.name,
        size: file.size,
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    return NextResponse.json({ url, file: fileRecord })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
