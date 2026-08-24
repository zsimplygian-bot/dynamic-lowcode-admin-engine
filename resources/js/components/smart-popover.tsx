import React, { useState, memo, useCallback } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface SmartPopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  children?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode)
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

export const SmartPopover = memo(({
  open,
  onOpenChange,
  trigger,
  children,
  align = "start",
  side = "bottom",
  className = "w-auto p-0 z-50",
  ...props
}: SmartPopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = useCallback((state: boolean) => {
    if (!isControlled) setInternalOpen(state)
    onOpenChange?.(state)
  }, [isControlled, onOpenChange])

  const close = useCallback(() => handleOpenChange(false), [handleOpenChange])

  return (
    <Popover {...{ ...props, open: isOpen, onOpenChange: handleOpenChange }}>
      {trigger && <PopoverTrigger {...{ asChild: true }}>{trigger}</PopoverTrigger>}
      <PopoverContent {...{ align, side, className }}>
        {typeof children === "function" ? children({ close }) : children}
      </PopoverContent>
    </Popover>
  )
})

SmartPopover.displayName = "SmartPopover"