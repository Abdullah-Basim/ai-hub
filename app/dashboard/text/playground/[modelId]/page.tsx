import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { TextPlayground } from "@/components/dashboard/text-playground"

export default async function TextPlaygroundPage({ params }: { params: { modelId: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null // This will be handled by middleware
  }

  const modelId = params.modelId

  // Fetch the model from the database
  const model = await prisma.model.findUnique({
    where: {
      id: modelId,
    },
  })

  if (!model || model.type !== "text") {
    notFound()
  }

  // Fetch user's usage data for this model
  const usage = await prisma.modelUsage.findUnique({
    where: {
      userId_modelId: {
        userId: session.user.id,
        modelId: model.id,
      },
    },
  })

  // Get user's plan
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      plan: true,
    },
  })

  return <TextPlayground model={model} usageCount={usage?.count || 0} userPlan={user?.plan || "free"} />
}
