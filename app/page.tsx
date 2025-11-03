"use client"

import { MessageSquareIcon, SearchIcon } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import type { AgentMessageMetadata } from "@/shared/agent-types"

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./components/ai-elements/conversation"
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "./components/ai-elements/message"
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputProvider,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "./components/ai-elements/prompt-input"
import { PromptInputSuggestionChips } from "./components/chat/prompt-suggestion-chips"
import {
  MessageFeedbackActions,
  type MessageFeedbackValue,
} from "./components/chat/message-feedback-actions"
import { useAgentChat } from "./hooks/use-agent-chat"
import { INITIAL_PROMPT, PROMPT_SUGGESTIONS } from "./lib/constants"

export default function HomePage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, handlePromptSubmit, status, errorMessage, isBusy } =
    useAgentChat({
      id: "sample-agent-minimal-ui",
    })

  const [feedbackByMessageId, setFeedbackByMessageId] = useState<
    Record<string, MessageFeedbackValue>
  >({})

  const handleFeedbackChange = useCallback(
    (messageId: string, nextValue: MessageFeedbackValue | undefined) => {
      setFeedbackByMessageId((prev) => {
        const updated = { ...prev }

        if (!nextValue) {
          delete updated[messageId]
          return updated
        }

        return { ...updated, [messageId]: nextValue }
      })
    },
    [],
  )

  const getTextFromMessage = (message: (typeof messages)[0]): string => {
    return message.parts
      .filter(
        (
          part,
        ): part is Extract<
          (typeof message.parts)[number],
          { type: "text"; text: string }
        > => part.type === "text",
      )
      .map((part) => part.text)
      .join("")
  }

  return (
    <PromptInputProvider initialInput={INITIAL_PROMPT}>
      <div className="relative flex size-full flex-col divide-y overflow-hidden">
        {/* Header */}
        <header className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-xl font-semibold">Sample Agent Playground</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ax / LangWatch / Vercel AI SDK を組み合わせた AI
              エージェントのデモ
            </p>
          </div>
        </header>

        {/* Messages Area */}
        <Conversation className="flex-1">
          <ConversationContent className="mx-auto max-w-3xl space-y-4 px-4 py-4 sm:px-6">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquareIcon className="size-12" />}
                title="まだメッセージがありません"
                description="最初のメッセージを送ってみましょう！"
              />
            ) : (
              messages
                .filter((message) => message.role !== "system")
                .map((message) => {
                  const metadata = message.metadata as
                    | AgentMessageMetadata
                    | undefined

                  return (
                    <Message key={message.id} from={message.role}>
                      <MessageContent
                        variant={message.role === "user" ? "contained" : "flat"}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {getTextFromMessage(message)}
                        </p>
                        {message.role === "assistant" && metadata?.meta && (
                          <div className="mt-2 rounded-lg border border-emerald-200/50 bg-emerald-50/50 px-3 py-2 text-xs text-emerald-900">
                            <div className="space-y-0.5">
                              <p>
                                モデル:{" "}
                                <span className="font-medium">
                                  {metadata.meta.model}
                                </span>
                              </p>
                              <p className="text-emerald-800">
                                ライブ推論:{" "}
                                {metadata.meta.usedLiveModel
                                  ? "有効"
                                  : "オフライン"}
                              </p>
                              {metadata.meta.ace && (
                                <p className="text-emerald-800">
                                  ACE プレイブック: v
                                  {metadata.meta.ace.playbookVersion}（
                                  {metadata.meta.ace.source === "artifact"
                                    ? "artifact"
                                    : "seed"}
                                  ）
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {message.role === "assistant" && (
                          <MessageFeedbackActions
                            className="pt-1"
                            disabled={isBusy}
                            onChange={(value) =>
                              handleFeedbackChange(message.id, value)
                            }
                            value={feedbackByMessageId[message.id]}
                          />
                        )}
                      </MessageContent>
                      <MessageAvatar
                        src={
                          message.role === "user"
                            ? "/user-avatar.png"
                            : "/ai-avatar.png"
                        }
                        name={message.role === "user" ? "You" : "Agent"}
                      />
                    </Message>
                  )
                })
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Error Message */}
        {errorMessage && (
          <div
            className="bg-destructive/10 px-4 py-2 text-sm text-destructive"
            role="alert"
          >
            <div className="mx-auto max-w-3xl">エラー: {errorMessage}</div>
          </div>
        )}

        {/* Input Area */}
        <div className="grid shrink-0 gap-4 px-4 py-4 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            {/* Suggestion Chips */}
            {messages.length === 0 && (
              <div className="mb-4">
                <PromptInputSuggestionChips
                  disabled={isBusy}
                  suggestions={PROMPT_SUGGESTIONS}
                />
              </div>
            )}

            {/* Prompt Input */}
            <PromptInput
              accept="image/*"
              globalDrop
              multiple
              maxFiles={4}
              onError={(err) => console.warn("PromptInput error:", err)}
              onSubmit={handlePromptSubmit}
            >
              <PromptInputHeader>
                <PromptInputAttachments>
                  {(file) => <PromptInputAttachment data={file} />}
                </PromptInputAttachments>
              </PromptInputHeader>

              <PromptInputBody>
                <PromptInputTextarea
                  ref={textareaRef}
                  disabled={isBusy}
                  placeholder="What would you like to know?"
                />
              </PromptInputBody>

              <PromptInputFooter>
                <PromptInputTools>
                  {/* Plus button for attachments */}
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger
                      aria-label="その他のアクション"
                      disabled={isBusy}
                    />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments label="ファイルを添付" />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>

                  {/* Voice input button */}
                  <PromptInputSpeechButton
                    textareaRef={textareaRef}
                    disabled={isBusy}
                    aria-label="音声入力"
                  />

                  {/* Search icon button */}
                  <PromptInputButton disabled={isBusy} aria-label="検索">
                    <SearchIcon className="size-4" />
                    <span className="text-sm">Search</span>
                  </PromptInputButton>

                  {/* Model selector */}
                  <PromptInputModelSelect
                    value="gpt-5"
                    onValueChange={() => {}}
                    disabled={isBusy}
                  >
                    <PromptInputModelSelectTrigger className="h-8 min-w-[100px]">
                      <PromptInputModelSelectValue />
                    </PromptInputModelSelectTrigger>
                    <PromptInputModelSelectContent>
                      <PromptInputModelSelectItem value="gpt-5">
                        GPT-5
                      </PromptInputModelSelectItem>
                    </PromptInputModelSelectContent>
                  </PromptInputModelSelect>
                </PromptInputTools>

                <PromptInputSubmit disabled={isBusy} status={status} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>
    </PromptInputProvider>
  )
}
