import { Groq } from "groq-sdk"
import * as env from "./env"

// Check if GROQ_API_KEY is available
const groqApiKey = env.GROQ_API_KEY
if (!groqApiKey && typeof window === "undefined") {
  console.warn("GROQ_API_KEY is not defined in environment variables")
}

// Create a singleton instance of the Groq client
export const groqClient = new Groq({
  apiKey: groqApiKey || "",
})

// Available Groq models
export const GROQ_MODELS = {
  MIXTRAL: "mixtral-8x7b-32768",
  LLAMA3: "llama3-70b-8192",
  LLAMA3_INSTRUCT: "llama3-8b-8192",
  GEMMA: "gemma-7b-it",
}

// Helper function to generate text with Groq
export async function generateWithGroq(prompt: string, modelId: string = GROQ_MODELS.MIXTRAL) {
  try {
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: modelId,
    })

    return {
      text: completion.choices[0]?.message?.content || "",
      success: true,
    }
  } catch (error) {
    console.error("Error generating with Groq:", error)
    return {
      text: "",
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate content",
    }
  }
}
