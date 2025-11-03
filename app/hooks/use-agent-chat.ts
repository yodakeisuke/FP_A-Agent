"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useCallback, useMemo } from "react"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import type { AgentUIMessage } from "@/shared/agent-types"

export interface UseAgentChatOptions {
  id: string
  apiEndpoint?: string
}

export function useAgentChat({
  id,
  apiEndpoint = "/api/agent-chat",
}: UseAgentChatOptions) {
  const transport = useMemo(
    () => new DefaultChatTransport<AgentUIMessage>({ api: apiEndpoint }),
    [apiEndpoint],
  )

  const { messages, sendMessage, status, error } = useChat<AgentUIMessage>({
    id,
    transport,
  })

  const errorMessage = error?.message ?? (error ? String(error) : undefined)
  const isBusy = status === "submitted" || status === "streaming"

  const handlePromptSubmit = useCallback(
    async ({ text, files }: PromptInputMessage) => {
      const trimmed = text?.trim() ?? ""

      if (!trimmed && (!files || files.length === 0)) {
        return
      }

      const attachmentSummary =
        files && files.length > 0
          ? files
              .map(
                (file) =>
                  `- ${file.filename ?? file.mediaType ?? "添付ファイル"}`,
              )
              .join("\n")
          : ""

      const payload = [
        trimmed,
        attachmentSummary && `[添付ファイル]\n${attachmentSummary}`,
      ]
        .filter(Boolean)
        .join("\n\n")

      await sendMessage({ text: payload })
    },
    [sendMessage],
  )

  const statusLabel =
    status === "streaming"
      ? "返信を生成しています…"
      : status === "submitted"
        ? "メッセージを送信中です…"
        : "ライブ推論は OPENAI_API_KEY / LANGWATCH_API_KEY の設定で切り替わります。"

  return {
    messages,
    handlePromptSubmit,
    status,
    statusLabel,
    errorMessage,
    isBusy,
  }
}
