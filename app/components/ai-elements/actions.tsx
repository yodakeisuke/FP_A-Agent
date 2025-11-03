"use client"

import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import type { HTMLAttributes } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ActionsProps = HTMLAttributes<HTMLDivElement>

export const Actions = ({ className, ...props }: ActionsProps) => (
  <div
    className={cn(
      "flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground",
      className,
    )}
    {...props}
  />
)

export type EvaluationValue = "positive" | "negative"

export type ActionsEvaluateProps = {
  value?: EvaluationValue
  onChange?: (value?: EvaluationValue) => void
  disabled?: boolean
  className?: string
}

const positiveActiveClasses =
  "bg-emerald-100 text-emerald-900 hover:bg-emerald-100 hover:text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-50"
const negativeActiveClasses =
  "bg-rose-100 text-rose-900 hover:bg-rose-100 hover:text-rose-900 dark:bg-rose-500/20 dark:text-rose-50"

export const ActionsEvaluate = ({
  value,
  onChange,
  disabled,
  className,
}: ActionsEvaluateProps) => {
  const handleToggle = (nextValue: EvaluationValue) => {
    if (disabled) return
    const resolved = value === nextValue ? undefined : nextValue
    onChange?.(resolved)
  }

  return (
    <div className={cn("flex items-center gap-1 text-muted-foreground", className)}>
      <span className="hidden text-[0.65rem] uppercase tracking-wide sm:inline">評価</span>
      <div className="flex items-center gap-1">
        <Button
          aria-label="高評価"
          aria-pressed={value === "positive"}
          className={cn(
            "transition-colors",
            value === "positive" && positiveActiveClasses,
          )}
          disabled={disabled}
          onClick={() => handleToggle("positive")}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <ThumbsUpIcon className="size-4" />
          <span className="sr-only">高評価を送信</span>
        </Button>
        <Button
          aria-label="低評価"
          aria-pressed={value === "negative"}
          className={cn(
            "transition-colors",
            value === "negative" && negativeActiveClasses,
          )}
          disabled={disabled}
          onClick={() => handleToggle("negative")}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <ThumbsDownIcon className="size-4" />
          <span className="sr-only">低評価を送信</span>
        </Button>
      </div>
      {value && (
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[0.65rem] font-semibold capitalize",
            value === "positive"
              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-50"
              : "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-50",
          )}
        >
          {value === "positive" ? "高評価" : "低評価"}
        </span>
      )}
    </div>
  )
}
