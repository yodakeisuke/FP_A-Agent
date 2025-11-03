import { randomUUID } from "node:crypto"
import { createUIMessageStream, createUIMessageStreamResponse } from "ai"
import { runAgent } from "@/agent/agent"
import type {
  AgentMessageMetadata,
  AgentResult,
  AgentUIMessage,
} from "@/shared/agent-types"

export const runtime = "nodejs"

type ChatRequestBody = {
  id?: string
  messages?: AgentUIMessage[]
}

function extractLatestUserMessage(messages: AgentUIMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const candidate = messages[index]
    if (candidate.role !== "user") {
      continue
    }

    const text = candidate.parts
      .filter(
        (
          part,
        ): part is Extract<
          (typeof candidate.parts)[number],
          { type: "text"; text: string }
        > => part.type === "text",
      )
      .map((part) => part.text)
      .join("\n")
      .trim()

    if (text.length > 0) {
      return text
    }
  }

  return ""
}

export async function POST(request: Request) {
  const { messages = [] } = (await request.json()) as ChatRequestBody
  const userMessage = extractLatestUserMessage(messages)

  console.info("[api/agent-chat] received message", userMessage)

  const stream = createUIMessageStream<AgentUIMessage>({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const messageId = randomUUID()
      const textPartId = randomUUID()

      try {
        const result: AgentResult = await runAgent(userMessage)
        console.info("[api/agent-chat] runAgent succeeded", {
          messageId,
          usedLiveModel: result.meta.usedLiveModel,
          model: result.meta.model,
        })
        const metadata: AgentMessageMetadata = {
          meta: result.meta,
        }

        writer.write({
          type: "start",
          messageId,
          messageMetadata: metadata,
        })

        writer.write({
          type: "text-start",
          id: textPartId,
        })

        writer.write({
          type: "text-delta",
          id: textPartId,
          delta: result.message,
        })

        writer.write({
          type: "text-end",
          id: textPartId,
        })

        writer.write({
          type: "data-meta",
          id: `meta-${messageId}`,
          data: result.meta,
        })

        writer.write({
          type: "finish",
          messageMetadata: metadata,
        })
      } catch (error) {
        console.error("[api/agent-chat] runAgent failed", error)
        writer.write({
          type: "error",
          errorText: error instanceof Error ? error.message : "Unknown error",
        })
      }
    },
  })

  return createUIMessageStreamResponse({ stream })
}
