import React, { forwardRef, memo, useCallback } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BaseTriggerProps, RenderIcon, sizeClasses, colorClasses } from "@/lib/trigger-utils"

type BaseItem = {
  label?: string
  icon?: LucideIcon
  color?: string
  disabled?: boolean
  variant?: "default" | "destructive"
  action?: () => void
}

export type SDItem =
  | "-"
  | { separator: true }
  | (BaseItem & { type?: "item"; custom?: React.ReactNode })
  | (BaseItem & { type: "checkbox"; checked: boolean; onChange: (v: boolean) => void })

export interface SmartDropdownProps extends BaseTriggerProps {
  buttonLabel?: React.ReactNode
  label?: string
  labelExtra?: React.ReactNode
  items: SDItem[]
  align?: "start" | "center" | "end"
  closeOnSelect?: boolean
  itemsMaxHeight?: number | string
  disableHover?: boolean
}

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation()

const DropdownItemRow = memo(({ item, iconSize, disableHover, prevent }: { item: SDItem; iconSize?: number | string; disableHover: boolean; prevent: (e: Event) => void }) => {
  if (item === "-" || ("separator" in item && item.separator)) return <DropdownMenuSeparator />

  if (typeof item === "object" && "custom" in item && item.custom !== undefined) {
    return <div {...{ onClick: stopPropagation, className: "w-full" }}>{item.custom}</div>
  }

  const hoverClass = disableHover ? "focus:bg-transparent focus:text-inherit" : "focus:bg-accent focus:text-accent-foreground"

  if (item.type === "checkbox") {
    const { checked, disabled, onChange: onCheckedChange, icon, label: text } = item
    return (
      <DropdownMenuCheckboxItem {...{ checked, disabled, onCheckedChange, onSelect: prevent, className: cn("cursor-pointer", hoverClass) }}>
        <RenderIcon {...{ icon, size: iconSize, className: "mr-2 opacity-80" }} />
        <span>{text}</span>
      </DropdownMenuCheckboxItem>
    )
  }

  const { disabled, variant, action: onClick, icon, color, label } = item
  return (
    <DropdownMenuItem {...{ disabled, variant, onClick, onSelect: prevent, className: cn("cursor-pointer", hoverClass) }}>
      <RenderIcon {...{ icon, size: iconSize, className: "opacity-80" }} />
      <span {...{ className: color }}>{label}</span>
    </DropdownMenuItem>
  )
})
DropdownItemRow.displayName = "DropdownItemRow"

export const SmartDropdown = memo(
  forwardRef<HTMLButtonElement, SmartDropdownProps>(function SmartDropdown({
    icon: Icon,
    buttonLabel,
    buttonClassName: btnClassName,
    variant = "default",
    buttonColor,
    badge,
    badgeClassName,
    iconSize,
    size = "md",
    label,
    labelExtra,
    items,
    align = "end",
    closeOnSelect = false,
    itemsMaxHeight,
    disableHover = false,
  }, ref) {
    const prevent = useCallback((e: Event) => {
      if (!closeOnSelect) e.preventDefault()
    }, [closeOnSelect])

    const config = sizeClasses[size]
    const finalIconSize = iconSize ?? config.iconSize

    const buttonClassName = cn(
      "relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors cursor-pointer shrink-0",
      !buttonLabel ? config.iconOnly : config.btn,
      buttonColor && variant === "default" && colorClasses[buttonColor],
      btnClassName
    )

    const badgeClass = cn(
      "absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] leading-none bg-secondary text-secondary-foreground font-medium",
      badgeClassName
    )

    return (
      <DropdownMenu>
        <DropdownMenuTrigger {...{ asChild: true }}>
          <Button {...{ ref, variant, className: buttonClassName }}>
            <RenderIcon {...{ icon: Icon, size: finalIconSize }} />
            {buttonLabel}
            {badge !== undefined && badge !== null && <Badge {...{ className: badgeClass }}>{badge}</Badge>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent {...{ align }}>
          {(label || labelExtra) && (
            <>
              <DropdownMenuLabel {...{ className: "flex items-center justify-between gap-2" }}>
                {label && <span>{label}</span>}
                {labelExtra && <div {...{ onClick: stopPropagation, className: "font-normal" }}>{labelExtra}</div>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          <div {...{ className: cn(itemsMaxHeight && "overflow-y-auto"), style: itemsMaxHeight ? { maxHeight: itemsMaxHeight } : undefined }}>
            {items.map((it, idx) => (
              <DropdownItemRow {...{ key: idx, item: it, iconSize: finalIconSize, disableHover, prevent }} />
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  })
)
SmartDropdown.displayName = "SmartDropdown"