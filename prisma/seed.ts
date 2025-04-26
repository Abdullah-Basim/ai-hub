import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Starting database seeding...")
    // Clean up existing data
    await prisma.modelUsage.deleteMany({})
    await prisma.prompt.deleteMany({})
    await prisma.model.deleteMany({})

    // Create text models
    const textModels = [
      {
        name: "Gemini Pro",
        description: "Google's multimodal AI model that can understand and generate text, code, and more.",
        type: "text",
        tier: "premium",
        provider: "Google",
        modelId: "gemini-pro",
        isActive: true,
      },
      {
        name: "Mixtral 8x7B",
        description: "Mixture of experts model with strong performance across various tasks.",
        type: "text",
        tier: "free",
        provider: "Groq",
        modelId: "mixtral-8x7b-32768",
        isActive: true,
      },
      {
        name: "Llama 3 70B",
        description: "Meta's large language model with strong reasoning capabilities.",
        type: "text",
        tier: "premium",
        provider: "Groq",
        modelId: "llama3-70b-8192",
        isActive: true,
      },
      {
        name: "Claude 3 Opus",
        description: "Advanced AI assistant with strong reasoning and conversation capabilities.",
        type: "text",
        tier: "ultra-premium",
        provider: "Anthropic",
        modelId: "claude-3-opus-20240229",
        isActive: true,
      },
    ]

    for (const model of textModels) {
      await prisma.model.create({
        data: model,
      })
    }

    // Create image models
    const imageModels = [
      {
        name: "DALL-E 3",
        description: "Create realistic images and art from natural language descriptions.",
        type: "image",
        tier: "premium",
        provider: "OpenAI",
        modelId: "dall-e-3",
        isActive: true,
      },
      {
        name: "Stable Diffusion XL",
        description: "Open-source image generation model with high-quality outputs.",
        type: "image",
        tier: "free",
        provider: "Stability AI",
        modelId: "sdxl",
        isActive: true,
      },
      {
        name: "Midjourney",
        description: "Create detailed and artistic images from text descriptions.",
        type: "image",
        tier: "premium",
        provider: "Midjourney",
        modelId: "midjourney-v5",
        isActive: true,
      },
    ]

    for (const model of imageModels) {
      await prisma.model.create({
        data: model,
      })
    }

    // Create video models
    const videoModels = [
      {
        name: "Sora",
        description: "Create realistic videos from text descriptions with spatial and temporal consistency.",
        type: "video",
        tier: "ultra-premium",
        provider: "OpenAI",
        modelId: "sora-1.0",
        isActive: true,
      },
      {
        name: "Gen-2",
        description: "Generate videos from text or image inputs with high quality.",
        type: "video",
        tier: "premium",
        provider: "Runway",
        modelId: "gen-2",
        isActive: true,
      },
    ]

    for (const model of videoModels) {
      await prisma.model.create({
        data: model,
      })
    }

    // Create feature flags
    await prisma.featureFlag.createMany({
      skipDuplicates: true,
      data: [
        {
          name: "api_access",
          description: "Enable API access for users",
          isEnabled: true,
        },
        {
          name: "file_uploads",
          description: "Enable file uploads",
          isEnabled: true,
        },
        {
          name: "advanced_analytics",
          description: "Enable advanced analytics features",
          isEnabled: false,
        },
      ],
    })

    console.log("Feature flags created successfully")

    console.log("Database seeded successfully!")
  } catch (e) {
    console.error("Error seeding database:", e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
