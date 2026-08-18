import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog"
import type { LucideIcon } from "lucide-react"
export interface SmartModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: LucideIcon
  iconSize?: number | string
  children?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode)
  size?: "sm" | "md" | "lg" | string
}
const sizeClasses: Record<string, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
}
export const SmartModal: React.FC<SmartModalProps> = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  icon: Icon,
  iconSize = 20,
  children,
  size = "md",
  ...props
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const handleOpenChange = (state: boolean) => {
    if (!isControlled) setInternalOpen(state)
    onOpenChange?.(state)
  }
  const close = () => handleOpenChange(false)
  const dialogSizeClass = sizeClasses[size] ?? size
  return (
    <Dialog {...{ ...props, open: isOpen, onOpenChange: handleOpenChange }}>
      {trigger && <DialogTrigger {...{ asChild: true }}>{trigger}</DialogTrigger>}
      <DialogContent {...{ className: `${dialogSizeClass} flex flex-col max-h-[90dvh]` }}>
        {(title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle {...{}}>
                {Icon && <Icon {...{ style: { width: iconSize, height: iconSize } }} />} {title}
              </DialogTitle>
            )}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children && (
          <div {...{ className: "flex-1 min-h-0 flex flex-col overflow-hidden" }}>
            {typeof children === "function" ? children({ close }) : children}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}