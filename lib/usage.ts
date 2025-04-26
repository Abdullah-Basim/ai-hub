import { prisma } from "./prisma"

interface TrackUsageOptions {
  userId: string
  apiKeyId?: string | null
  service: string
  operation: string
  resourceId?: string | null
  units?: number
  cost?: number
  statusCode?: number | null
}

// Track usage of a service
export async function trackUsage({
  userId,
  apiKeyId = null,
  service,
  operation,
  resourceId = null,
  units = 1,
  cost = 0,
  statusCode = null,
}: TrackUsageOptions) {
  try {
    const usageRecord = await prisma.usageRecord.create({
      data: {
        userId,
        apiKeyId,
        service,
        operation,
        resourceId,
        units,
        cost,
        statusCode,
      },
    })

    return usageRecord
  } catch (error) {
    console.error("Error tracking usage:", error)
    // Don't throw - usage tracking should not break the main flow
    return null
  }
}

// Get usage summary for a user
export async function getUserUsageSummary(userId: string, period: "day" | "week" | "month" = "month") {
  // Calculate the start date based on the period
  const startDate = new Date()
  if (period === "day") {
    startDate.setDate(startDate.getDate() - 1)
  } else if (period === "week") {
    startDate.setDate(startDate.getDate() - 7)
  } else {
    startDate.setMonth(startDate.getMonth() - 1)
  }

  // Get usage records for the period
  const usageRecords = await prisma.usageRecord.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
      },
    },
  })

  // Calculate totals by service
  const serviceUsage = usageRecords.reduce(
    (acc, record) => {
      const key = record.service
      if (!acc[key]) {
        acc[key] = {
          units: 0,
          cost: 0,
          operations: {},
        }
      }

      acc[key].units += record.units
      acc[key].cost += record.cost

      // Track by operation
      const opKey = record.operation
      if (!acc[key].operations[opKey]) {
        acc[key].operations[opKey] = {
          units: 0,
          cost: 0,
        }
      }

      acc[key].operations[opKey].units += record.units
      acc[key].operations[opKey].cost += record.cost

      return acc
    },
    {} as Record<string, { units: number; cost: number; operations: Record<string, { units: number; cost: number }> }>,
  )

  return {
    period,
    startDate,
    endDate: new Date(),
    totalUnits: usageRecords.reduce((sum, record) => sum + record.units, 0),
    totalCost: usageRecords.reduce((sum, record) => sum + record.cost, 0),
    serviceUsage,
  }
}
