"use client"

import { useCallback } from "react"
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type MessageFeedbackValue = "positive" | "negative"

export interface MessageFeedbackActionsProps {
  value?: MessageFeedbackValue
  onChange?: (value: MessageFeedbackValue | undefined) => void
  disabled?: boolean
  className?: string
}

export function MessageFeedbackActions({
  value,
  onChange,
  disabled,
  className,
}: MessageFeedbackActionsProps) {
  const handleSelect = useCallback(
    (nextValue: MessageFeedbackValue) => () => {
      if (!onChange) {
        return
      }

      if (value === nextValue) {
        onChange(undefined)
        return
      }

      onChange(nextValue)
    },
    [onChange, value],
  )

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="mr-1 font-medium text-foreground">この回答を評価</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={value === "positive"}
        aria-label="この回答が役に立った"
        disabled={disabled}
        onClick={handleSelect("positive")}
        className={cn(
          "border border-transparent",
          value === "positive" &&
            "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700",
        )}
      >
        <ThumbsUpIcon className="size-4" />
        <span>役に立った</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={value === "negative"}
        aria-label="この回答は改善が必要"
        disabled={disabled}
        onClick={handleSelect("negative")}
        className={cn(
          "border border-transparent",
          value === "negative" &&
            "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/10 hover:text-destructive",
        )}
      >
        <ThumbsDownIcon className="size-4" />
        <span>改善が必要</span>
      </Button>
      {value ? (
        <span className="ml-1 text-[11px]">
          {value === "positive"
            ? "「役に立った」に評価しました"
            : "「改善が必要」に評価しました"}
        </span>
      ) : null}
    </div>
  )
}
