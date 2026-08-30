import React, { useState, memo } from "react"
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

const SIZE_MAP: Record<string, string> = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" }

export const SmartModal = memo(({ open, onOpenChange, trigger, title, description, children, size = "md", ...props }: SmartModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = (state: boolean) => {
    if (!isControlled) setInternalOpen(state)
    onOpenChange?.(state)
  }

  const close = () => handleOpenChange(false)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className={`${SIZE_MAP[size] ?? size} flex max-h-[90dvh] flex-col`}>
        {(title || description) && (
          <DialogHeader className="text-center sm:text-center">
            {title && <DialogTitle className="text-center">{title}</DialogTitle>}
            {description && <DialogDescription className="text-center">{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {typeof children === "function" ? children({ close }) : children}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
})

SmartModal.displayName = "SmartModal"