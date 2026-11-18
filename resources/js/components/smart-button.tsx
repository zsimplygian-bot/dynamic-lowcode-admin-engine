import React, { forwardRef, useState } from "react"
import { Link } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SmartTooltip } from "@/components/smart-tooltip"
import { SmartModal } from "@/components/smart-modal"
import { DynamicIcon } from "@/components/dynamic-icon"
import { BaseTriggerProps, sizeClasses, colorClasses } from "@/lib/trigger-utils"
export interface SmartButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">, Omit<BaseTriggerProps, "icon"> {
  icon?: string; iconPosition?: "left" | "right"; label?: React.ReactNode; loadingLabel?: React.ReactNode
  tooltip?: React.ReactNode; tooltipSide?: "top" | "right" | "bottom" | "left"; isLoading?: boolean
  confirmation?: boolean | { title?: React.ReactNode; description?: React.ReactNode; confirmText?: string; cancelText?: string }
  href?: any; prefetch?: any; onSuccess?: () => void
}
export const SmartButton = forwardRef<HTMLButtonElement, SmartButtonProps>(({
  icon, iconSize, iconPosition = "left", label, loadingLabel, tooltip, tooltipSide = "top",
  children, className, buttonClassName, variant = "default", disabled, size = "md",
  buttonColor, isLoading, type = "button", onClick, confirmation, href, prefetch, onSuccess, ...props
}, ref) => {
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const text = label ?? children, busy = isLoading || confirmLoading, isDisabled = disabled || busy
  const cfg = sizeClasses[size], sz = iconSize ?? cfg.iconSize, iconName = busy ? "loader-2" : icon
  const iconEl = iconName && <DynamicIcon name={iconName} style={{ width: sz, height: sz }} className={cn(busy && "animate-spin")} />
  const content = <>{iconPosition === "left" && iconEl}{text && <span>{busy && loadingLabel ? loadingLabel : text}</span>}{iconPosition === "right" && iconEl}</>
  const btnClass = cn(!text ? cfg.iconOnly : cfg.btn, buttonColor && variant === "default" && colorClasses[buttonColor], buttonClassName, className)
  const isLink = Boolean(href) && !isDisabled
  const btn = isLink ? (
    <Button ref={ref} variant={variant} className={btnClass} asChild {...props}>
      <Link href={href} prefetch={prefetch}>{content}</Link>
    </Button>
  ) : (
    <Button ref={ref} type={type} variant={variant} disabled={isDisabled} className={btnClass}
      onClick={confirmation ? (e) => { e.preventDefault(); setOpen(true) } : onClick} {...props}>
      {content}
    </Button>
  )
  const el = tooltip ? <SmartTooltip content={tooltip} side={tooltipSide}>{btn}</SmartTooltip> : btn
  if (!confirmation) return el
  const conf = typeof confirmation === "object" ? confirmation : {}
  return (
    <>{el}
      <SmartModal open={open} onOpenChange={setOpen} title={conf.title ?? "Confirm action?"} description={conf.description ?? "¿Are you sure?"} size="sm">
        {({ close }) => (
          <div className="flex justify-center gap-2 pt-2">
            <Button variant="outline" disabled={confirmLoading} onClick={close}>
              <DynamicIcon name="undo-2" className="size-4" /><span>{conf.cancelText ?? "Cancel"}</span>
            </Button>
            <Button variant={variant} disabled={confirmLoading} className={cn(buttonColor && variant === "default" && colorClasses[buttonColor])}
              onClick={async (e) => { try { setConfirmLoading(true); await onClick?.(e); onSuccess?.(); close() } finally { setConfirmLoading(false) } }}>
              <DynamicIcon name={confirmLoading ? "loader-2" : (icon ?? "check")} className={cn("size-4", confirmLoading && "animate-spin")} />
              <span>{confirmLoading ? "Loading..." : (conf.confirmText ?? "Confirm")}</span>
            </Button>
          </div>
        )}
      </SmartModal>
    </>
  )
})
SmartButton.displayName = "SmartButton"