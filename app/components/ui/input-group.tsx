"use client"

import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex w-full items-stretch rounded-lg border border-border bg-background shadow-sm transition-[color,box-shadow] outline-none",
        "min-h-[40px] min-w-0 has-[>textarea]:min-h-0",

        // Variants based on alignment.
        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:flex-col",
        "has-[>[data-align=block-end]]:flex-col",

        // Focus state.
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/20",

        // Error state.
        "has-[[data-slot][aria-invalid=true]]:ring-2 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive",

        className,
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex items-center gap-2 text-sm text-muted-foreground select-none [&>svg:not([class*='size-'])]:size-4 group-data-[disabled=true]/input-group:opacity-50",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-3 pr-2",
        "inline-end": "order-last pr-3 pl-2",
        "block-start": "order-first w-full justify-start px-3 pt-2 pb-2",
        "block-end": "order-last w-full justify-start px-3 pt-2 pb-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          if (!(e.target as HTMLElement).closest("button")) {
            e.currentTarget.parentElement?.querySelector("input")?.focus()
          }
        }
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "shadow-none flex items-center gap-1.5 text-sm",
  {
    variants: {
      size: {
        xs: "h-7 px-2 rounded-md [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 px-3 rounded-md [&>svg:not([class*='size-'])]:size-4",
        "icon-xs":
          "size-7 rounded-md p-0 [&>svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 rounded-md p-0 [&>svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "sm",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent px-3 py-2.5 shadow-none focus-visible:ring-0 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
