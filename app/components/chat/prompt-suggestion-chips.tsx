"use client"

import {
  PromptInputButton,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input"

export interface PromptInputSuggestionChipsProps {
  suggestions: string[]
  disabled?: boolean
}

export function PromptInputSuggestionChips({
  suggestions,
  disabled,
}: PromptInputSuggestionChipsProps) {
  const controller = usePromptInputController()

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {suggestions.map((suggestion) => (
        <PromptInputButton
          key={suggestion}
          disabled={disabled}
          onClick={() => controller.textInput.setInput(suggestion)}
          size="sm"
          className="rounded-full border border-border/60 bg-muted/70 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          {suggestion}
        </PromptInputButton>
      ))}
    </div>
  )
}
