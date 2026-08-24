import { forwardRef, memo, useCallback } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Size = "xs" | "sm" | "md" | "lg"
const sizeStyles: Record<Size, { icon: string; text: string }> = {
  xs: { icon: "h-6 w-6", text: "h-6 px-1.5" },
  sm: { icon: "h-8 w-8", text: "h-8 px-2.5" },
  md: { icon: "h-9 w-9", text: "h-9 px-3" },
  lg: { icon: "h-12 w-12", text: "h-12 px-4" },
}

type BaseItem = {
  key?: string
  label?: string
  icon?: LucideIcon
  color?: string
  disabled?: boolean
  variant?: "default" | "destructive"
  action?: () => void
}

export type SDItem =
  | "-"
  | { separator: true; key?: string }
  | (BaseItem & { type?: "item"; custom?: React.ReactNode })
  | (BaseItem & { type: "checkbox"; checked: boolean; onChange: (v: boolean) => void })

interface Props {
  icon?: LucideIcon
  buttonLabel?: React.ReactNode
  buttonClassName?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  badge?: string | number
  badgeClassName?: string
  iconSize?: number | string
  size?: Size
  label?: string
  labelExtra?: React.ReactNode
  items: SDItem[]
  align?: "start" | "center" | "end"
  closeOnSelect?: boolean
  itemsMaxHeight?: number | string
  disableHover?: boolean
}

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation()

const RenderIcon = memo(({ icon: IconComp, size, className }: { icon?: LucideIcon; size: number | string; className?: string }) => {
  if (!IconComp) return null
  return <IconComp {...{ style: { width: size, height: size }, className: cn("shrink-0", className) }} />
})
RenderIcon.displayName = "RenderIcon"

const DropdownItemRow = memo(({ item, iconSize, disableHover, prevent }: { item: SDItem; iconSize: number | string; disableHover: boolean; prevent: (e: Event) => void }) => {
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
  forwardRef<HTMLButtonElement, Props>(function SmartDropdown(props, ref) {
    const {
      icon: Icon,
      buttonLabel,
      buttonClassName: btnClassName,
      variant = "default",
      badge,
      badgeClassName,
      iconSize = 20,
      size = "md",
      label,
      labelExtra,
      items,
      align = "end",
      closeOnSelect = true,
      itemsMaxHeight,
      disableHover = false,
    } = props

    const prevent = useCallback((e: Event) => { if (!closeOnSelect) e.preventDefault() }, [closeOnSelect])

    const btnClass = cn("relative inline-flex items-center justify-center gap-2 rounded-full", !buttonLabel && Icon ? sizeStyles[size].icon : sizeStyles[size].text, btnClassName)
    const badgeClass = cn("absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] leading-none bg-secondary text-secondary-foreground font-medium", badgeClassName)

    return (
      <DropdownMenu>
        <DropdownMenuTrigger {...{ asChild: true }}>
          <Button {...{ ref, variant, className: btnClass }}>
            <RenderIcon {...{ icon: Icon, size: iconSize }} />
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
          <div {...{ className: cn(itemsMaxHeight && "overflow-y-auto"), style: { maxHeight: itemsMaxHeight } }}>
            {items.map((it, idx) => {
              const itemKey = typeof it === "object" ? it.key || ("label" in it ? it.label : undefined) : undefined
              return <DropdownItemRow {...{ key: itemKey ?? `sd_item_${idx}`, item: it, iconSize, disableHover, prevent }} />
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  })
)
SmartDropdown.displayName = "SmartDropdown"