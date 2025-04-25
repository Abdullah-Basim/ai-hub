import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ImageIcon, Film, ArrowRight } from "lucide-react"
import { prisma } from "@/lib/db"

export default async function HistoryPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null // This will be handled by middleware
  }

  // Fetch the user's prompt history from the database
  const prompts = await prisma.prompt.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      model: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10, // Limit to 10 most recent prompts
  })

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getModelIcon = (type: string) => {
    switch (type) {
      case "text":
        return <MessageSquare className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Film className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Prompt History</h1>
        <p className="text-muted-foreground">View and revisit your previous AI interactions.</p>
      </div>

      {prompts.length > 0 ? (
        <div className="grid gap-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    {getModelIcon(prompt.model.type)}
                    <span className="font-medium">{prompt.model.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {prompt.model.type}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDate(prompt.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm">{prompt.input}</p>
                <div className="mt-4 flex justify-end">
                  <Link href={`/dashboard/${prompt.model.type}/playground/${prompt.model.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      View <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No History Yet</CardTitle>
            <CardDescription>Start using AI models to build your prompt history.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Link href="/dashboard">
              <Button>Explore Models</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
