import { NextResponse } from "next/server"
import { groqClient } from "@/lib/groq"

export async function GET() {
  try {
    // Check if GROQ_API_KEY is defined
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          status: "error",
          message: "GROQ_API_KEY is not defined in environment variables",
        },
        { status: 500 },
      )
    }

    // Test the Groq API with a simple request
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Hello, are you working?",
        },
      ],
      model: "mixtral-8x7b-32768",
      max_tokens: 10, // Limit tokens for quick response
    })

    return NextResponse.json({
      status: "ok",
      message: "Groq API is working correctly",
      modelResponse: completion.choices[0]?.message?.content || "",
    })
  } catch (error) {
    console.error("Groq health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to connect to Groq API",
      },
      { status: 500 },
    )
  }
}
