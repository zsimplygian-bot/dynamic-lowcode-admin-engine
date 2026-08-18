import { forwardRef, memo } from "react"
import { Link } from "@inertiajs/react"
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
  label?: string
  icon?: LucideIcon
  color?: string
  disabled?: boolean
  variant?: "default" | "destructive"
  action?: () => void
  to?: string
  external?: boolean
}

export type SDItem =
  | "-"
  | { separator: true }
  | (BaseItem & { type?: "item"; custom?: React.ReactNode })
  | (BaseItem & { type: "checkbox"; checked: boolean; onChange: (v: boolean) => void })

interface Props {
  triggerIcon?: LucideIcon
  triggerLabel?: React.ReactNode
  triggerButtonClassName?: string
  triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  triggerBadge?: string | number
  triggerBadgeClassName?: string
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

export const SmartDropdown = memo(
  forwardRef<HTMLButtonElement, Props>(function SmartDropdown(props, ref) {
    const {
      triggerIcon: Icon,
      triggerLabel,
      triggerButtonClassName,
      triggerVariant: variant = "default",
      triggerBadge,
      triggerBadgeClassName,
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

    const prevent = (e: Event) => { if (!closeOnSelect) e.preventDefault() }

    const renderIcon = (IconComp?: LucideIcon, className?: string) =>
      IconComp ? <IconComp {...{ style: { width: iconSize, height: iconSize }, className: cn("shrink-0", className) }} /> : null

    const renderItem = (it: SDItem, key: number) => {
      if (it === "-" || ("separator" in it && it.separator)) return <DropdownMenuSeparator {...{ key }} />
      
      if (typeof it === "object" && "custom" in it && it.custom !== undefined) {
        return (
          <div {...{ key, onClick: (e) => e.stopPropagation(), className: "w-full" }}>
            {it.custom}
          </div>
        )
      }

      if (it.type === "checkbox") {
        const { checked, disabled, onChange: onCheckedChange, icon, label: text } = it
        const checkboxClassName = cn(
          "cursor-pointer",
          disableHover ? "focus:bg-transparent focus:text-inherit" : "focus:bg-accent focus:text-accent-foreground"
        )
        return (
          <DropdownMenuCheckboxItem {...{ key, checked, disabled, onCheckedChange, onSelect: prevent, className: checkboxClassName }}>
            {renderIcon(icon, "mr-2 opacity-80")}
            <span {...{}}>{text}</span>
          </DropdownMenuCheckboxItem>
        )
      }
      const content = (
        <>
          {renderIcon(it.icon, "opacity-80")}
          <span {...{ className: it.color }}>{it.label}</span>
        </>
      )
      const wrapped = !it.to ? content : (
        <Link {...{ href: it.to, ...(it.external ? { as: "a", target: "_blank", rel: "noreferrer" } : {}), className: "flex w-full items-center gap-2" }}>
          {content}
        </Link>
      )
      const { disabled, variant: itemVariant, action: onClick } = it
      const itemClassName = cn(
        "cursor-pointer",
        disableHover ? "focus:bg-transparent focus:text-inherit" : "focus:bg-accent focus:text-accent-foreground"
      )
      return (
        <DropdownMenuItem {...{ key, disabled, variant: itemVariant, onClick, onSelect: prevent, className: itemClassName }}>
          {wrapped}
        </DropdownMenuItem>
      )
    }

    const buttonClassName = cn(
      "relative inline-flex items-center justify-center gap-2 rounded-full",
      !triggerLabel && Icon ? sizeStyles[size].icon : sizeStyles[size].text,
      triggerButtonClassName
    )
    
    const badgeClass = cn(
      "absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] leading-none bg-secondary text-secondary-foreground font-medium",
      triggerBadgeClassName
    )

    return (
      <DropdownMenu {...{}}>
        <DropdownMenuTrigger {...{ asChild: true }}>
          <Button {...{ ref, variant, className: buttonClassName }}>
            {renderIcon(Icon)}
            {triggerLabel}
            {!!triggerBadge && (
              <Badge {...{ className: badgeClass }}>
                {triggerBadge}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent {...{ align }}>
          {(label || labelExtra) && (
            <>
              <DropdownMenuLabel {...{ className: "flex items-center justify-between gap-2" }}>
                {label && <span {...{}}>{label}</span>}
                {labelExtra && <div {...{ onClick: (e) => e.stopPropagation(), className: "font-normal" }}>{labelExtra}</div>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator {...{}} />
            </>
          )}
          <div {...{ className: cn(itemsMaxHeight && "overflow-y-auto"), style: { maxHeight: itemsMaxHeight } }}>
            {items.map(renderItem)}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  })
)
SmartDropdown.displayName = "SmartDropdown"