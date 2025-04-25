import { put, del } from "@vercel/blob"
import { nanoid } from "nanoid"
import { prisma } from "./prisma"

// Helper function to generate a unique filename
export function generateUniqueFilename(originalFilename: string): string {
  const extension = originalFilename.split(".").pop()
  return `${nanoid()}.${extension}`
}

// Upload a file to Vercel Blob and save metadata to the database
export async function uploadFile(
  file: File,
  userId: string,
  options?: { expiresIn?: number },
): Promise<{ url: string; fileRecord: any }> {
  try {
    const uniqueFilename = generateUniqueFilename(file.name)
    const pathname = `uploads/${userId}/${uniqueFilename}`

    // Default expiry is 30 days (in seconds)
    const expiresIn = options?.expiresIn || 30 * 24 * 60 * 60

    // Upload to Vercel Blob
    const { url } = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      ...(expiresIn ? { expiresAt: new Date(Date.now() + expiresIn * 1000) } : {}),
    })

    // Save file metadata to database
    const fileRecord = await prisma.file.create({
      data: {
        userId,
        type: file.type.split("/")[0], // e.g., "image" from "image/png"
        storagePath: pathname,
        filename: file.name,
        size: file.size,
        expiry: new Date(Date.now() + expiresIn * 1000),
      },
    })

    return { url, fileRecord }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// List files for a user
export async function listUserFiles(userId: string) {
  return prisma.file.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

// Delete a file from Vercel Blob and the database
export async function deleteFile(fileId: string, userId: string) {
  try {
    // Get the file record
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    })

    if (!file) {
      throw new Error("File not found")
    }

    // Delete from Vercel Blob
    await del(file.storagePath)

    // Delete from database
    await prisma.file.delete({
      where: {
        id: fileId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}
