import React, { forwardRef, memo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DynamicIcon } from "@/components/dynamic-icon"
import { BaseTriggerProps, sizeClasses, colorClasses } from "@/lib/trigger-utils"

export type SDItem = "-" | { separator?: boolean; type?: "item" | "checkbox" | "custom"; label?: string; icon?: string; color?: string; disabled?: boolean; variant?: "default" | "destructive"; 
  checked?: boolean; alignContent?: "left" | "center"; content?: React.ReactNode; action?: () => void; onChange?: (v: boolean) => void }

export interface SmartDropdownProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, Omit<BaseTriggerProps, 'icon'> {
  icon?: string; iconPosition?: "left" | "right"; buttonLabel?: React.ReactNode; label?: string; items?: SDItem[]; align?: "start" | "center" | "end"; closeOnSelect?: boolean; 
  itemsMaxHeight?: number | string; disableHover?: boolean;
}

export const SmartDropdown = memo(forwardRef<HTMLButtonElement, SmartDropdownProps>(({ icon, iconPosition = "left", buttonLabel, buttonClassName, className, variant = "default", buttonColor, badge, badgeClassName, iconSize, size = "md", label, items = [], align = "end", closeOnSelect = false, itemsMaxHeight, disableHover = false, disabled, ...props }, ref) => {
  const prevent = useCallback((e: Event) => { if (!closeOnSelect) e.preventDefault() }, [closeOnSelect])
  const finalIconSize = iconSize ?? sizeClasses[size].iconSize
  const hoverClass = disableHover ? "focus:bg-transparent focus:text-inherit" : "focus:bg-accent focus:text-accent-foreground"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button ref={ref} variant={variant} disabled={disabled} className={cn("relative", !buttonLabel ? sizeClasses[size].iconOnly : sizeClasses[size].btn, buttonColor && variant === "default" && colorClasses[buttonColor], buttonClassName, className)} {...props}>
          {iconPosition === "left" && icon && <DynamicIcon name={icon} style={{ width: finalIconSize, height: finalIconSize }} />}
          {buttonLabel && <span>{buttonLabel}</span>}
          {iconPosition === "right" && icon && <DynamicIcon name={icon} style={{ width: finalIconSize, height: finalIconSize }} />}
          {badge !== undefined && badge !== null && <Badge className={cn("absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] leading-none bg-secondary text-secondary-foreground font-medium pointer-events-none", badgeClassName)}>{badge}</Badge>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {label && (
          <>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <div className={cn(itemsMaxHeight && "overflow-y-auto")} style={itemsMaxHeight ? { maxHeight: itemsMaxHeight } : undefined}>
          {items.map((it, idx) => {
            if (it === "-" || (typeof it === "object" && it.separator)) return <DropdownMenuSeparator key={idx} />
            if (it.type === "custom") return <div key={idx} onKeyDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>{it.content}</div>
            
            const isCenter = it.alignContent === "center"
            if (it.type === "checkbox") {
              return (
                <DropdownMenuCheckboxItem key={idx} checked={!!it.checked} disabled={it.disabled} onCheckedChange={it.onChange} onSelect={prevent} className={cn("cursor-pointer", hoverClass)}>
                  <div className={cn("flex items-center w-full", isCenter ? "justify-center gap-1.5" : "gap-2")}>
                    {it.icon && <DynamicIcon name={it.icon} style={{ width: finalIconSize, height: finalIconSize }} className="opacity-80" />}
                    <span>{it.label}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              )
            }
            return (
              <DropdownMenuItem key={idx} disabled={it.disabled} variant={it.variant} onClick={it.action} onSelect={prevent} className={cn("cursor-pointer", hoverClass)}>
                <div className={cn("flex items-center w-full", isCenter ? "justify-center gap-1.5" : "gap-2")}>
                  {it.icon && <DynamicIcon name={it.icon} style={{ width: finalIconSize, height: finalIconSize }} className="opacity-80" />}
                  <span className={it.color}>{it.label}</span>
                </div>
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}))
SmartDropdown.displayName = "SmartDropdown"