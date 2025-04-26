"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { useToast } from "@/hooks/use-toast"
import { Trash2, FileText, FileIcon, ImageIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface File {
  id: string
  filename: string
  type: string
  size: number
  storagePath: string
  expiry: string
  createdAt: string
}

export function FileGallery() {
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchFiles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/files")

      if (!response.ok) {
        throw new Error("Failed to fetch files")
      }

      const data = await response.json()
      setFiles(data.files)
    } catch (error) {
      console.error("Error fetching files:", error)
      toast({
        title: "Error",
        description: "Failed to load your files",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleUploadComplete = (url: string, file: any) => {
    setFiles((prev) => [file, ...prev])
  }

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete file")
      }

      setFiles((prev) => prev.filter((file) => file.id !== fileId))

      toast({
        title: "File deleted",
        description: "Your file has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-6 w-6" />
      case "text":
        return <FileText className="h-6 w-6" />
      default:
        return <FileIcon className="h-6 w-6" />
    }
  }

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`
    }
  }

  return (
    <div className="space-y-6">
      <FileUpload onUploadComplete={handleUploadComplete} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : files.length > 0 ? (
          files.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              {file.type === "image" ? (
                <div className="aspect-square bg-muted">
                  <img
                    src={`/${file.storagePath}`}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-square bg-muted flex items-center justify-center">{getFileIcon(file.type)}</div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(file.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No files uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
