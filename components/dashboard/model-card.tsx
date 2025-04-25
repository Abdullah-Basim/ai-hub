import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

interface ModelCardProps {
  id: string
  name: string
  description: string
  tier: "free" | "premium" | "ultra-premium"
  provider: string
  usageCount?: number
  maxFreeUsage?: number
  type: "text" | "image" | "video"
  userPlan?: string
}

export function ModelCard({
  id,
  name,
  description,
  tier,
  provider,
  usageCount = 0,
  maxFreeUsage = 3,
  type,
  userPlan = "free",
}: ModelCardProps) {
  const tierColor = {
    free: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    premium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "ultra-premium": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  }

  const isLimited = tier !== "free" && userPlan === "free" && usageCount >= maxFreeUsage

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge className={tierColor[tier]}>
            {tier === "ultra-premium" ? "Ultra Premium" : tier === "premium" ? "Premium" : "Free"}
          </Badge>
        </div>
        <CardDescription className="text-xs">Provided by {provider}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{description}</p>
        {tier !== "free" && userPlan === "free" && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">
              {usageCount} / {maxFreeUsage} free prompts used
            </p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min((usageCount / maxFreeUsage) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/dashboard/${type}/playground/${id}`} className="w-full">
          <Button variant={isLimited ? "outline" : "default"} className="w-full gap-1" disabled={isLimited}>
            {isLimited ? "Upgrade to Use" : "Use Model"} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
