import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

const FALLBACK_MODEL = "gpt-5-nano"

export function getOpenAIKey(): string | undefined {
  return (
    process.env.OPENAI_API_KEY ??
    process.env.OPENAI_APIKEY ??
    process.env.OPENAI_KEY
  )
}

export function getDefaultModel(): string {
  return process.env.OPENAI_MODEL ?? FALLBACK_MODEL
}

export async function generateLiveReply(userMessage: string): Promise<string> {
  const model = openai(getDefaultModel())
  const result = await generateText({
    model,
    prompt: `You are a cheerful assistant. Reply concisely to the user input:\n\n${userMessage}`,
    experimental_telemetry: { isEnabled: true },
  })
  return result.text
}
