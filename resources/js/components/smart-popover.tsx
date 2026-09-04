import React, { useState, memo } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface SmartPopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode)
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  size?: "sm" | "md" | "lg" | string
  className?: string
}

const SIZE_MAP: Record<string, string> = { sm: "w-48", md: "w-64", lg: "w-80" }

export const SmartPopover = memo(({
  open, onOpenChange, trigger, title, description, children, align = "start", side = "bottom", size, className, ...props
}: SmartPopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = (state: boolean) => {
    if (!isControlled) setInternalOpen(state)
    onOpenChange?.(state)
  }

  const close = () => handleOpenChange(false)
  const sizeClass = size ? (SIZE_MAP[size] ?? size) : "w-auto"

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange} {...props}>
      {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}
      <PopoverContent align={align} side={side} className={`${sizeClass} p-0 z-50 ${className ?? ""}`}>
        {(title || description) && (
          <div className="p-2 border-b text-center">
            {title && <h4 className="font-medium text-xs leading-none">{title}</h4>}
            {description && <p className="text-[11px] text-muted-foreground mt-1">{description}</p>}
          </div>
        )}
        {children && (typeof children === "function" ? children({ close }) : children)}
      </PopoverContent>
    </Popover>
  )
})

SmartPopover.displayName = "SmartPopover"