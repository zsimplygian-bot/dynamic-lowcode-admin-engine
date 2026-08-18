import * as React from "react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"

export interface SmartTooltipProps {
  content?: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delayDuration?: number
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

export function SmartTooltip({
  content,
  side = "top",
  align = "center",
  delayDuration = 0,
  disabled = false,
  className,
  children,
}: SmartTooltipProps) {
  if (!content || disabled) {
    return <>{children}</>
  }

  return (
    <TooltipProvider {...{ delayDuration }}>
      <Tooltip>
        <TooltipTrigger {...{ asChild: true }}>
          {children}
        </TooltipTrigger>
        <TooltipContent {...{ side, align, className }}>
          {typeof content === "string" ? <p>{content}</p> : content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}