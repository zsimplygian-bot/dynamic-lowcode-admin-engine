import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog"

export interface SmartModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode)
  size?: "sm" | "md" | "lg" | string
}

const sizeClasses: Record<string, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
}

export const SmartModal: React.FC<SmartModalProps> = ({ open, onOpenChange, trigger, title, description, children, size = "md", ...props }) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const handleOpenChange = (state: boolean) => { if (!isControlled) setInternalOpen(state); onOpenChange?.(state) }
  const close = () => handleOpenChange(false)
  const dialogSizeClass = sizeClasses[size] ?? size

  return (
    <Dialog {...{ ...props, open: isOpen, onOpenChange: handleOpenChange }}>
      {trigger && <DialogTrigger {...{ asChild: true }}>{trigger}</DialogTrigger>}
      
      {/* Condicionamos la existencia del contenido al estado de apertura */}
      {isOpen && (
        <DialogContent {...{ className: `${dialogSizeClass} flex flex-col max-h-[90dvh]` }}>
          {(title || description) && (
            <DialogHeader {...{ className: "text-center sm:text-center" }}>
              {title && <DialogTitle {...{ className: "text-center" }}>{title}</DialogTitle>}
              {description && <DialogDescription {...{ className: "text-center" }}>{description}</DialogDescription>}
            </DialogHeader>
          )}
          {children && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {typeof children === "function" ? children({ close }) : children}
            </div>
          )}
        </DialogContent>
      )}
    </Dialog>
  )
}