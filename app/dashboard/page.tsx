import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ImageIcon, Film, ArrowRight, FileImage } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null // This will be handled by middleware
  }

  // Fetch recent prompts
  const recentPrompts = await prisma.prompt.findMany({
    where: {
      userId: user.id,
    },
    include: {
      model: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // Fetch recent files
  const recentFiles = await prisma.file.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // Get user's plan
  const userDetails = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      plan: true,
    },
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ""}</h1>
        <p className="text-muted-foreground">
          Access all AI models in one place. Get started by selecting a model type.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <div>
              <CardTitle>Text Models</CardTitle>
              <CardDescription>Generate text with AI models</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Access powerful language models for text generation, summarization, and more.
            </p>
            <Link href="/dashboard/text">
              <Button className="w-full gap-1">
                Explore Text Models <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            <div>
              <CardTitle>Image Models</CardTitle>
              <CardDescription>Generate and edit images with AI</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">Create stunning images from text descriptions or edit existing images.</p>
            <Link href="/dashboard/image">
              <Button className="w-full gap-1">
                Explore Image Models <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Film className="h-5 w-5" />
            <div>
              <CardTitle>Video Models</CardTitle>
              <CardDescription>Generate videos with AI</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">Create videos from text descriptions or transform images into videos.</p>
            <Link href="/dashboard/video">
              <Button className="w-full gap-1">
                Explore Video Models <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent AI interactions</CardDescription>
            </div>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentPrompts.length > 0 ? (
              <div className="space-y-4">
                {recentPrompts.map((prompt) => (
                  <div key={prompt.id} className="flex items-start gap-2">
                    {prompt.model.type === "text" ? (
                      <MessageSquare className="h-4 w-4 mt-0.5" />
                    ) : prompt.model.type === "image" ? (
                      <ImageIcon className="h-4 w-4 mt-0.5" />
                    ) : (
                      <Film className="h-4 w-4 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{prompt.model.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{prompt.input}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No recent activity yet.</p>
                <p className="text-sm">Start using AI models to see your history here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>Recent Files</CardTitle>
              <CardDescription>Your recently uploaded files</CardDescription>
            </div>
            <Link href="/dashboard/files">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentFiles.length > 0 ? (
              <div className="space-y-4">
                {recentFiles.map((file) => (
                  <div key={file.id} className="flex items-start gap-2">
                    <FileImage className="h-4 w-4 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate" title={file.filename}>
                          {file.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {file.size < 1024
                          ? `${file.size} B`
                          : file.size < 1024 * 1024
                            ? `${(file.size / 1024).toFixed(1)} KB`
                            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No files uploaded yet.</p>
                <p className="text-sm">Upload files to see them here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Your current plan and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="font-medium">
              Current Plan: <span className="font-normal capitalize">{userDetails?.plan || "Free"}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {userDetails?.plan === "premium"
                ? "You have unlimited access to all premium models."
                : "You have access to all free models and 3 prompts per premium model."}
            </p>
          </div>
          <Link href="/dashboard/settings">
            <Button variant={userDetails?.plan === "premium" ? "outline" : "default"} className="w-full">
              {userDetails?.plan === "premium" ? "Manage Subscription" : "Upgrade to Premium"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
