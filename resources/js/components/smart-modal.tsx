import React, { useState, memo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog"

export interface SmartModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode)
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | string
  className?: string
  style?: React.CSSProperties
}

const SIZE_MAP: Record<string, string> = { 
  sm: "max-w-md", 
  md: "max-w-lg", 
  lg: "max-w-2xl", 
  xl: "max-w-3xl", 
  "2xl": "max-w-4xl", 
  "3xl": "max-w-5xl", 
  "4xl": "max-w-6xl", 
  "5xl": "max-w-7xl" 
}

export const SmartModal = memo(({ open, onOpenChange, trigger, title, description, children, size = "md", className = "", style, ...props }: SmartModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = (state: boolean) => {
    if (!isControlled) setInternalOpen(state)
    onOpenChange?.(state)
  }

  const close = () => handleOpenChange(false)

  const sizeClass = SIZE_MAP[size] ?? (size.startsWith("max-w-") ? size : `max-w-${size}`)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent style={style} className={`${sizeClass} flex max-h-[90dvh] flex-col ${className}`.trim()}>
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