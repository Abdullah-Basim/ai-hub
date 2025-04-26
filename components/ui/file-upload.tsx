"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, FileIcon, ImageIcon } from "lucide-react"

interface FileUploadProps {
  onUploadComplete?: (url: string, file: any) => void
  accept?: string
  maxSize?: number // in bytes
  className?: string
  multiple?: boolean
}

export function FileUpload({
  onUploadComplete,
  accept = "image/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = "",
  multiple = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Reset error state
    setError(null)

    // Validate file type
    if (!file.type.match(accept.replace("*", "."))) {
      setError(`Please upload a file of type: ${accept}`)
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size should be less than ${maxSize / (1024 * 1024)}MB`)
      return
    }

    setSelectedFile(file)

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setProgress(0)
    setError(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 300)

      // Upload file
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      setProgress(100)

      const data = await response.json()

      if (onUploadComplete) {
        onUploadComplete(data.url, data.file)
      }

      // Reset after a short delay
      setTimeout(() => {
        setSelectedFile(null)
        setPreview(null)
        setProgress(0)
        setIsUploading(false)
      }, 1000)
    } catch (error) {
      console.error("Error uploading file:", error)
      setError(error instanceof Error ? error.message : "Failed to upload file")
      setIsUploading(false)
      setProgress(0)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileIcon = () => {
    if (selectedFile?.type.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6" />
    }
    return <FileIcon className="h-6 w-6" />
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
    <div className={`w-full ${className}`}>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}

      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload file"
        >
          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium">Drag and drop your file here, or click to select</p>
          <p className="text-xs text-gray-500 mt-1">
            {accept === "image/*" ? "PNG, JPG, GIF up to " : "Files up to "}
            {maxSize / (1024 * 1024)}MB
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            aria-label="File input"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {preview ? (
                <div className="w-12 h-12 rounded overflow-hidden mr-3">
                  <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center mr-3">
                  {getFileIcon()}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            {!isUploading && (
              <Button variant="ghost" size="icon" onClick={handleCancel} aria-label="Cancel">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-gray-500">Uploading... {progress}%</p>
            </div>
          ) : (
            <Button onClick={handleUpload} className="w-full mt-2">
              Upload File
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
