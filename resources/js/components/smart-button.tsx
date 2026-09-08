import React, { forwardRef, useState } from "react"
import { Link } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SmartTooltip } from "@/components/smart-tooltip"
import { SmartModal } from "@/components/smart-modal"
import { Loader2, Undo2 } from "lucide-react"
import { BaseTriggerProps, RenderIcon, sizeClasses, colorClasses } from "@/lib/trigger-utils"
export interface SmartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, BaseTriggerProps {
  iconPosition?: "left" | "right"
  label?: React.ReactNode
  loadingLabel?: React.ReactNode
  tooltip?: React.ReactNode
  tooltipSide?: "top" | "right" | "bottom" | "left"
  isLoading?: boolean
  confirmation?: { title?: React.ReactNode; description?: React.ReactNode; confirmText?: string; cancelText?: string }
  href?: string
  prefetch?: boolean
}
export const SmartButton = forwardRef<HTMLButtonElement, SmartButtonProps>((
  { icon: Icon, iconSize, iconPosition = "left", label, loadingLabel, tooltip, tooltipSide = "top", children, className, buttonClassName, variant = "default", disabled, size = "md",
    buttonColor, isLoading, type = "button", onClick, confirmation, href, prefetch, ...props
  }, ref
) => {
  const [openConfirm, setOpenConfirm] = useState(false)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)
  const text = label ?? children
  const busy = isLoading || isConfirmLoading
  const isDisabled = disabled || busy
  const config = sizeClasses[size]
  const finalIconSize = iconSize ?? config.iconSize
  const modalIconSize = sizeClasses.md.iconSize
  const iconEl = <RenderIcon icon={busy ? Loader2 : Icon} size={finalIconSize} className={busy ? "animate-spin" : undefined} />
  const textEl = text && <span>{busy ? (loadingLabel ?? text) : text}</span>
  const content = ( <span className="inline-flex items-center gap-2"> {iconPosition === "right" ? <>{textEl}{iconEl}</> : <>{iconEl}{textEl}</>} </span> )
  const ariaLabel = props["aria-label"] ?? (!text && typeof tooltip === "string" ? tooltip : undefined)
  const finalClassName = cn( "", !text ? config.iconOnly : config.btn, buttonColor && variant === "default" && colorClasses[buttonColor], buttonClassName, className )
  const buttonProps = {
    ref, type: href ? undefined : type, variant, disabled: isDisabled, "aria-label": ariaLabel, className: finalClassName,
    onClick: confirmation ? (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault(); e.stopPropagation(); setOpenConfirm(true)
    } : onClick,
    ...props,
  }
  const buttonEl = href ? (
    <Button {...{ ...buttonProps, asChild: true }}>
      <Link {...{ href: isDisabled ? "#" : href, prefetch, onClick: isDisabled ? (e) => e.preventDefault() : undefined, tabIndex: isDisabled ? -1 : undefined }}> {content} </Link>
    </Button>
  ) : ( <Button {...buttonProps}>{content}</Button> )
  const rendered = tooltip ? <SmartTooltip {...{ content: tooltip, side: tooltipSide }}>{buttonEl}</SmartTooltip> : buttonEl
  if (!confirmation) return rendered
  return (
    <>{rendered}
      <SmartModal {...{ open: openConfirm, onOpenChange: setOpenConfirm, title: confirmation.title ?? "Confirmar acción", description: confirmation.description, size: "sm" }}>
        {({ close }) => (
          <div className="flex justify-center gap-50 pt-2">
            <Button {...{ variant: "outline", disabled: isConfirmLoading, onClick: close }}> <RenderIcon icon={Undo2} size={modalIconSize} />
              <span>{confirmation.cancelText ?? "Cancelar"}</span>
            </Button>
            <Button {...{ variant,  disabled: isConfirmLoading, className: cn(buttonColor && variant === "default" && colorClasses[buttonColor]),
                onClick: async (e) => {
                  try {
                    setIsConfirmLoading(true)
                    await onClick?.(e)
                    close()
                  } finally {
                    setIsConfirmLoading(false)
                  }
                },
              }}
            >
              <span className="inline-flex items-center gap-1.5">
                <RenderIcon icon={isConfirmLoading ? Loader2 : Icon} size={modalIconSize} className={isConfirmLoading ? "animate-spin" : undefined} />
                <span>{isConfirmLoading ? "Cargando..." : (confirmation.confirmText ?? "Confirmar")}</span>
              </span>
            </Button>
          </div>
        )}
      </SmartModal>
    </>
  )
})
SmartButton.displayName = "SmartButton"