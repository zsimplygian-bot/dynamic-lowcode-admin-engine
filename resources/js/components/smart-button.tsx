import { forwardRef } from "react"
import { Link } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SmartTooltip } from "@/components/smart-tooltip"
import { Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
type Size = "xs" | "sm" | "md" | "lg"
export interface SmartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icons?: LucideIcon | LucideIcon[]
  iconPosition?: "left" | "right"
  iconSize?: number
  label?: React.ReactNode
  loadingLabel?: React.ReactNode
  tooltip?: React.ReactNode
  tooltipSide?: "top" | "right" | "bottom" | "left"
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive"
  size?: Size
  buttonColor?: "green" | "red" | "blue" | "gray"
  isLoading?: boolean
  href?: string
  isExternal?: boolean
}
const sizeClasses: Record<Size, { padding: string; iconOnly: string }> = {
  xs: { padding: "h-6 px-2 text-xs", iconOnly: "h-6 w-6 px-0" },
  sm: { padding: "h-8 px-3 text-sm", iconOnly: "h-8 w-8 px-0" },
  md: { padding: "h-9 px-4 text-sm", iconOnly: "h-9 w-9 px-0" },
  lg: { padding: "h-12 px-6 text-base", iconOnly: "h-12 w-12 px-0" },
}
const colorClasses: Record<string, string> = {
  green: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
  red: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
  blue: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
  gray: "bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-900",
}
export const SmartButton = forwardRef<HTMLButtonElement, SmartButtonProps>(
  (
    {
      icons,
      iconPosition = "left",
      iconSize = 18,
      label,
      loadingLabel,
      tooltip,
      tooltipSide = "top",
      children,
      className,
      variant = "default",
      disabled = false,
      size = "md",
      buttonColor,
      isLoading = false,
      onClick,
      type = "button",
      href,
      isExternal = false,
      ...props
    },
    ref
  ) => {
    const iconsArray = (Array.isArray(icons) ? icons : icons ? [icons] : []).filter(Boolean)
    const hasText = !!(label || children)
    const isIconOnly = !hasText && iconsArray.length === 1
    const IconsEl = iconsArray.length > 0 && (
      <span className="inline-flex items-center gap-1.5 shrink-0">
        {iconsArray.map((Icon, i) => (
          <Icon key={i} style={{ width: iconSize, height: iconSize }} />
        ))}
      </span>
    )
    const innerContent = isLoading ? (
      <span className="inline-flex items-center gap-2">
        <Loader2 className="animate-spin shrink-0" style={{ width: iconSize, height: iconSize }} />
        {hasText && <span>{loadingLabel ?? label ?? children}</span>}
      </span>
    ) : (
      <span className="inline-flex items-center gap-2">
        {iconPosition === "left" && IconsEl}
        {hasText && <span>{label ?? children}</span>}
        {iconPosition === "right" && IconsEl}
      </span>
    )
    const sharedClasses = cn(
      "rounded-full inline-flex items-center justify-center font-medium transition-colors cursor-pointer",
      isIconOnly ? sizeClasses[size].iconOnly : sizeClasses[size].padding,
      buttonColor && variant === "default" && colorClasses[buttonColor],
      className
    )
    const shouldBeExternal = isExternal || (href ? /^https?:\/\//.test(href) : false)
    const buttonContent = href ? (
      <Button {...{ variant, className: sharedClasses, asChild: true }} disabled={disabled || isLoading}>
        {shouldBeExternal ? (
          <a {...{ href, target: "_blank", rel: "noopener noreferrer" }}>
            {innerContent}
          </a>
        ) : (
          <Link {...{ href }}>
            {innerContent}
          </Link>
        )}
      </Button>
    ) : (
      <Button {...{ ref, type, variant, onClick, disabled: disabled || isLoading, className: sharedClasses, ...props }}>
        {innerContent}
      </Button>
    )
    return tooltip ? (
      <SmartTooltip {...{ content: tooltip, side: tooltipSide }}>{buttonContent}</SmartTooltip>
    ) : buttonContent
  }
)
SmartButton.displayName = "SmartButton"