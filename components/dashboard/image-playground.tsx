"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Trash2, ImageIcon, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/ui/file-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ImagePlaygroundProps {
  model: {
    id: string
    name: string
    description: string
    type: string
    tier: string
    provider: string
    modelId: string
  }
  usageCount: number
  userPlan: string
  files: {
    id: string
    filename: string
    storagePath: string
    createdAt: string
  }[]
}

export function ImagePlayground({ model, usageCount, userPlan, files }: ImagePlaygroundProps) {
  const [prompt, setPrompt] = useState("")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedFileId, setGeneratedFileId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [style, setStyle] = useState("photographic")
  const [dimensions, setDimensions] = useState("1:1")
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!prompt.trim() && !selectedFile) return

    // Check if the user has reached the free usage limit for premium models
    if (model.tier !== "free" && usageCount >= 3 && userPlan === "free") {
      toast({
        title: "Usage limit reached",
        description: "You've used all your free prompts for this model. Upgrade to Premium to continue.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setGeneratedImage(null)
    setGeneratedFileId(null)

    try {
      // Determine which API endpoint to use based on the provider
      let endpoint = ""
      if (model.provider === "Stability AI") {
        endpoint = "/api/models/stable-diffusion"
      } else {
        // For other providers, we'll use a mock endpoint for now
        endpoint = "/api/models/mock-image"
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          modelId: model.id,
          style,
          dimensions,
          imageUrl: selectedFileUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate image")
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
      setGeneratedFileId(data.file.id)

      toast({
        title: "Image generated",
        description: "Your image has been generated successfully",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setPrompt("")
    setSelectedFile(null)
    setSelectedFileUrl(null)
    setGeneratedImage(null)
    setGeneratedFileId(null)
  }

  const handleFileUploadComplete = (url: string, file: any) => {
    // Refresh the page to show the new file
    window.location.reload()
  }

  const handleFileSelect = (fileId: string) => {
    setSelectedFile(fileId)

    // Find the file in the files array
    const file = files.find((f) => f.id === fileId)
    if (file) {
      // Use relative URL to avoid CORS issues
      setSelectedFileUrl(`/${file.storagePath}`)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ai-hub-generated-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Error",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const tierColor = {
    free: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    premium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "ultra-premium": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{model.name}</h1>
          <Badge className={tierColor[model.tier as keyof typeof tierColor]}>
            {model.tier === "ultra-premium" ? "Ultra Premium" : model.tier === "premium" ? "Premium" : "Free"}
          </Badge>
        </div>
        <p className="text-muted-foreground">{model.description}</p>
        {model.tier !== "free" && userPlan === "free" && (
          <p className="text-sm text-muted-foreground">You have used {usageCount}/3 free prompts with this model.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Describe the image you want to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="prompt">
                <TabsList className="mb-4">
                  <TabsTrigger value="prompt">Text Prompt</TabsTrigger>
                  <TabsTrigger value="image">Image Upload</TabsTrigger>
                  <TabsTrigger value="gallery">My Images</TabsTrigger>
                </TabsList>

                <TabsContent value="prompt">
                  <Textarea
                    placeholder="Enter your prompt here..."
                    className="min-h-[200px] resize-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </TabsContent>

                <TabsContent value="image">
                  <FileUpload accept="image/*" maxSize={5 * 1024 * 1024} onUploadComplete={handleFileUploadComplete} />
                </TabsContent>

                <TabsContent value="gallery">
                  {files.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className={`aspect-square rounded-md border-2 overflow-hidden cursor-pointer ${
                            selectedFile === file.id ? "border-primary" : "border-transparent"
                          }`}
                          onClick={() => handleFileSelect(file.id)}
                        >
                          <img
                            src={`/${file.storagePath}`}
                            alt={file.filename}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=100&width=100"
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <p className="mt-2 text-sm text-muted-foreground">No images uploaded yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleClear} disabled={isLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading || (!prompt.trim() && !selectedFile)}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {model.provider === "Stability AI" && (
            <Card>
              <CardHeader>
                <CardTitle>Advanced Options</CardTitle>
                <CardDescription>Customize your image generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Style</label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photographic">Photographic</SelectItem>
                        <SelectItem value="digital-art">Digital Art</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                        <SelectItem value="illustration">Illustration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dimensions</label>
                    <Select value={dimensions} onValueChange={setDimensions}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dimensions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">Square (1:1)</SelectItem>
                        <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                        <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>Your image will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square rounded-md border border-input bg-background flex items-center justify-center overflow-hidden">
              {generatedImage ? (
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt="Generated image"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  {isLoading ? (
                    <Loader2 className="h-12 w-12 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="h-12 w-12 opacity-50" />
                      <p className="mt-2 text-sm">Generated image will appear here</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            {generatedImage && (
              <>
                <Button variant="outline" className="flex-1" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
