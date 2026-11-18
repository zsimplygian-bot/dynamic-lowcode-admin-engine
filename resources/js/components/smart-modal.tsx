import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog"
import { cn } from "@/lib/utils"

const SIZES = {
  sm: "sm:max-w-md", md: "sm:max-w-lg", lg: "sm:max-w-2xl", xl: "sm:max-w-3xl",
  "2xl": "sm:max-w-4xl", "3xl": "sm:max-w-5xl", "4xl": "sm:max-w-5xl lg:max-w-6xl", "5xl": "sm:max-w-6xl lg:max-w-7xl",
  full: "sm:max-w-[96vw] w-[96vw]", fit: "sm:max-w-fit"
} as const
const COLORS = { blue: "border-t-blue-500", green: "border-t-green-500", red: "border-t-destructive", amber: "border-t-amber-500", gray: "border-t-slate-500" } as const

export type SmartModalProps = Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  trigger?: React.ReactNode; title?: React.ReactNode; description?: React.ReactNode
  size?: keyof typeof SIZES | string; color?: keyof typeof COLORS; className?: string
  children?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode)
}

export function SmartModal({ trigger, title, description, children, size = "sm", color, className, open, onOpenChange, ...props }: SmartModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const show = isControlled ? open : internalOpen
  const handleOpen = (state: boolean) => { if (!isControlled) setInternalOpen(state); onOpenChange?.(state) }
  const close = () => handleOpen(false)
  const sizeClass = SIZES[size as keyof typeof SIZES] ?? size

  return (
    <Dialog open={show} onOpenChange={handleOpen} {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn("w-full max-h-[90dvh] flex flex-col overflow-y-auto p-4 sm:p-6", sizeClass, color && `border-t-4 ${COLORS[color]}`, className)}>
        {(title || description) && (
          <DialogHeader className="text-center sm:text-center">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {typeof children === "function" ? children({ close }) : children}
      </DialogContent>
    </Dialog>
  )
}
export default SmartModal