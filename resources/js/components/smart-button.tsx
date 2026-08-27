import { forwardRef, useState } from "react"
import { Link } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SmartTooltip } from "@/components/smart-tooltip"
import { SmartModal } from "@/components/smart-modal"
import { Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface SmartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon | React.ComponentType<any> | boolean
  iconSize?: number
  label?: React.ReactNode
  loadingLabel?: React.ReactNode
  tooltip?: React.ReactNode
  tooltipSide?: "top" | "right" | "bottom" | "left"
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive"
  size?: "xs" | "sm" | "md" | "lg"
  buttonColor?: "green" | "red" | "blue" | "gray"
  isLoading?: boolean
  confirmation?: { title?: React.ReactNode; description?: React.ReactNode; confirmText?: string; cancelText?: string }
  href?: string
  prefetch?: boolean
}

const sizeClasses: Record<NonNullable<SmartButtonProps["size"]>, { btn: string; iconOnly: string; iconSize: number }> = {
  xs: { btn: "h-6 px-2 text-xs", iconOnly: "h-6 w-6 p-0", iconSize: 14 },
  sm: { btn: "h-8 px-3 text-sm", iconOnly: "h-8 w-8 p-0", iconSize: 16 },
  md: { btn: "h-9 px-4 text-sm", iconOnly: "h-9 w-9 p-0", iconSize: 18 },
  lg: { btn: "h-12 px-6 text-base", iconOnly: "h-12 w-12 p-0", iconSize: 22 },
}

const colorClasses: Record<NonNullable<SmartButtonProps["buttonColor"]>, string> = {
  green: "bg-green-600 hover:bg-green-700 text-white",
  red: "bg-red-600 hover:bg-red-700 text-white",
  blue: "bg-blue-600 hover:bg-blue-700 text-white",
  gray: "bg-gray-800 hover:bg-gray-900 text-white",
}

export const SmartButton = forwardRef<HTMLButtonElement, SmartButtonProps>(
  ({ icon: Icon, iconSize, label, loadingLabel, tooltip, tooltipSide = "top", children, className, variant = "default", disabled, size = "md", buttonColor, isLoading, type = "button", onClick, confirmation, href, prefetch, ...props }, ref) => {
    const [openConfirm, setOpenConfirm] = useState(false)
    const [isConfirmLoading, setIsConfirmLoading] = useState(false)
    const text = label ?? children
    const busy = isLoading || isConfirmLoading
    const isDisabled = disabled || busy
    const config = sizeClasses[size]
    const finalIconSize = iconSize ?? config.iconSize

    const IconComponent = typeof Icon === "function" || (typeof Icon === "object" && Icon !== null) ? Icon : null

    const content = (
      <span {...{ className: "inline-flex items-center gap-2" }}>
        {busy ? (
          <Loader2 {...{ style: { width: finalIconSize, height: finalIconSize }, className: "animate-spin shrink-0" }} />
        ) : IconComponent && (
          <IconComponent {...{ style: { width: finalIconSize, height: finalIconSize }, className: "shrink-0" }} />
        )}
        {text && <span>{busy ? (loadingLabel ?? text) : text}</span>}
      </span>
    )

    const buttonProps = {
      ref,
      type: href ? undefined : type,
      variant,
      disabled: isDisabled,
      className: cn("rounded-full inline-flex items-center justify-center font-medium transition-colors cursor-pointer shrink-0", !text ? config.iconOnly : config.btn, buttonColor && variant === "default" && colorClasses[buttonColor], className),
      onClick: confirmation ? (e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setOpenConfirm(true) } : onClick,
      ...props
    }

    const buttonEl = href ? (
      <Button {...{ ...buttonProps, asChild: true }}>
        <Link {...{ href, prefetch }}>{content}</Link>
      </Button>
    ) : (
      <Button {...buttonProps}>{content}</Button>
    )

    const rendered = tooltip ? <SmartTooltip {...{ content: tooltip, side: tooltipSide }}>{buttonEl}</SmartTooltip> : buttonEl

    if (!confirmation) return rendered

    return (
      <>
        {rendered}
        <SmartModal {...{ open: openConfirm, onOpenChange: setOpenConfirm, title: confirmation.title ?? "Confirmar acción", description: confirmation.description, size: "sm" }}>
          {({ close }) => (
            <div {...{ className: "flex justify-end gap-2 pt-4" }}>
              <Button {...{ variant: "outline", size: "sm", disabled: isConfirmLoading, onClick: close }}>
                {confirmation.cancelText ?? "Cancelar"}
              </Button>
              <Button {...{
                variant, size: "sm", disabled: isConfirmLoading,
                className: cn("rounded-full", buttonColor && variant === "default" && colorClasses[buttonColor]),
                onClick: async (e) => {
                  try {
                    setIsConfirmLoading(true)
                    await onClick?.(e)
                    close()
                  } finally {
                    setIsConfirmLoading(false)
                  }
                }
              }}>
                {isConfirmLoading ? (
                  <span {...{ className: "inline-flex items-center gap-2" }}>
                    <Loader2 {...{ className: "w-3.5 h-3.5 animate-spin shrink-0" }} />
                    <span>Cargando...</span>
                  </span>
                ) : (
                  confirmation.confirmText ?? "Confirmar"
                )}
              </Button>
            </div>
          )}
        </SmartModal>
      </>
    )
  }
)

SmartButton.displayName = "SmartButton"