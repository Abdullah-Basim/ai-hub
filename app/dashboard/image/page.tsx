import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ModelCard } from "@/components/dashboard/model-card"
import { prisma } from "@/lib/db"

export default async function ImageModelsPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null // This will be handled by middleware
  }

  // Fetch image models from the database
  const imageModels = await prisma.model.findMany({
    where: {
      type: "image",
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Fetch user's usage data
  const usageData = await prisma.modelUsage.findMany({
    where: {
      userId: session.user.id,
    },
  })

  // Create a map of model ID to usage count
  const usageMap = usageData.reduce(
    (acc, usage) => {
      acc[usage.modelId] = usage.count
      return acc
    },
    {} as Record<string, number>,
  )

  // Get user's plan
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      plan: true,
    },
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Image Models</h1>
        <p className="text-muted-foreground">Generate images from text descriptions or edit existing images.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {imageModels.map((model) => (
          <ModelCard
            key={model.id}
            id={model.id}
            name={model.name}
            description={model.description}
            tier={model.tier as any}
            provider={model.provider}
            usageCount={usageMap[model.id] || 0}
            type="image"
            userPlan={user?.plan || "free"}
          />
        ))}
      </div>
    </div>
  )
}
