import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ImageIcon, Film, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent AI interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <p>No recent activity yet.</p>
              <p className="text-sm">Start using AI models to see your history here.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Your current plan and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="font-medium">
                Current Plan: <span className="font-normal">Free</span>
              </p>
              <p className="text-sm text-muted-foreground">
                You have access to all free models and 3 prompts per premium model.
              </p>
            </div>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full">
                Upgrade to Premium
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
