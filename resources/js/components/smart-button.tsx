import React, { forwardRef, useState } from "react"
import { Link } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SmartTooltip } from "@/components/smart-tooltip"
import { SmartModal } from "@/components/smart-modal"
import { DynamicIcon } from "@/components/dynamic-icon"
import { BaseTriggerProps, sizeClasses, colorClasses } from "@/lib/trigger-utils"
export interface SmartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, Omit<BaseTriggerProps, 'icon'> {
  icon?: string
  iconPosition?: "left" | "right"
  label?: React.ReactNode
  loadingLabel?: React.ReactNode
  tooltip?: React.ReactNode
  tooltipSide?: "top" | "right" | "bottom" | "left"
  isLoading?: boolean
  confirmation?: boolean | { title?: React.ReactNode; description?: React.ReactNode; confirmText?: string; cancelText?: string }
  href?: string
  prefetch?: boolean
  onSuccess?: (...args: any[]) => void
}
export const SmartButton = forwardRef<HTMLButtonElement, SmartButtonProps>(({
  icon, iconSize, iconPosition = "left", label, loadingLabel, tooltip, tooltipSide = "top", children, className, buttonClassName, variant = "default", disabled, size = "md",
  buttonColor, isLoading, type = "button", onClick, confirmation, href, prefetch, onSuccess, ...props
}, ref) => {
  const [openConfirm, setOpenConfirm] = useState(false)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)
  const text = label ?? children
  const busy = isLoading || isConfirmLoading
  const isDisabled = disabled || busy
  const config = sizeClasses[size]
  const finalIconSize = iconSize ?? config.iconSize
  const ariaLabel = props["aria-label"] ?? (!text && typeof tooltip === "string" ? tooltip : undefined)
  const finalClassName = cn(!text ? config.iconOnly : config.btn, buttonColor && variant === "default" && colorClasses[buttonColor], buttonClassName, className)
  const activeIcon = busy ? "loader-2" : icon
  const iconEl = activeIcon && <DynamicIcon name={activeIcon} style={{ width: finalIconSize, height: finalIconSize }} className={busy ? "animate-spin" : undefined} />
  const textEl = busy ? (loadingLabel ?? text) : text
  const childrenContent = ( <> {iconPosition === "left" && iconEl} {textEl && <span>{textEl}</span>} {iconPosition === "right" && iconEl} </>
  )
  const buttonProps = {
    ref, type: href ? undefined : type, variant, disabled: isDisabled, "aria-label": ariaLabel, className: finalClassName,
    onClick: confirmation ? (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault(); e.stopPropagation(); setOpenConfirm(true)
    } : onClick,
    ...props,
  }
  const buttonEl = href ? (
    <Button {...buttonProps} asChild>
      <Link href={isDisabled ? "#" : href} prefetch={prefetch} onClick={isDisabled ? (e) => e.preventDefault() : undefined} tabIndex={isDisabled ? -1 : undefined}> {childrenContent} </Link>
    </Button>
  ) : ( <Button {...buttonProps}> {childrenContent} </Button>
  )
  const rendered = tooltip ? <SmartTooltip content={tooltip} side={tooltipSide}>{buttonEl}</SmartTooltip> : buttonEl
  if (!confirmation) return rendered
  const confirmConfig = typeof confirmation === "object" ? confirmation : {}
  const modalTitle = confirmConfig.title ?? "Confirmar acción"
  const modalDescription = confirmConfig.description ?? "¿Estás seguro de ejecutar esta acción?"
  return (
    <>{rendered}
      <SmartModal open={openConfirm} onOpenChange={setOpenConfirm} title={modalTitle} description={modalDescription} size="sm">
        {({ close }) => (
          <div className="flex justify-center gap-2 pt-2">
            <Button variant="outline" disabled={isConfirmLoading} onClick={close}>
              <DynamicIcon name="undo-2" className="size-4" />
              <span>{confirmConfig.cancelText ?? "Cancelar"}</span>
            </Button>
            <Button variant={variant} disabled={isConfirmLoading} className={cn(buttonColor && variant === "default" && colorClasses[buttonColor])}
              onClick={async (e) => {
                try {
                  setIsConfirmLoading(true)
                  await onClick?.(e)
                  onSuccess?.()
                  close()
                } finally {
                  setIsConfirmLoading(false)
                }
              }}
            >
              <DynamicIcon name={isConfirmLoading ? "loader-2" : (icon ?? "check")} className={cn("size-4", isConfirmLoading && "animate-spin")} />
              <span>{isConfirmLoading ? "Cargando..." : (confirmConfig.confirmText ?? "Confirmar")}</span>
            </Button>
          </div>
        )}
      </SmartModal>
    </>
  )
})
SmartButton.displayName = "SmartButton"