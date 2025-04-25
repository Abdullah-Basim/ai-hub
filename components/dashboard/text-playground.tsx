"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TextPlaygroundProps {
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
}

export function TextPlayground({ model, usageCount, userPlan }: TextPlaygroundProps) {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!prompt.trim()) return

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
    setResponse("")

    try {
      // Determine which API endpoint to use based on the provider
      let endpoint = ""
      if (model.provider === "Google") {
        endpoint = "/api/models/gemini"
      } else if (model.provider === "Groq") {
        endpoint = "/api/models/groq"
      } else {
        // For other providers, we'll use a mock endpoint for now
        endpoint = "/api/models/mock"
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          modelId: model.modelId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate response")
      }

      const data = await response.json()
      setResponse(data.text)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setPrompt("")
    setResponse("")
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
        <Card>
          <CardHeader>
            <CardTitle>Prompt</CardTitle>
            <CardDescription>Enter your prompt for the model</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your prompt here..."
              className="min-h-[200px] resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleClear} disabled={isLoading}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !prompt.trim()}>
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

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>Model output will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] rounded-md border border-input bg-background p-3">
              {response ? (
                <div className="whitespace-pre-wrap">{response}</div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Response will appear here"}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Responses are generated by AI and may not always be accurate.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
