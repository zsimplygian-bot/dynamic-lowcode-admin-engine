import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
export type TriggerSize = "xs" | "sm" | "md" | "lg"
export type TriggerColor = "green" | "red" | "blue" | "gray"
export type TriggerVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
export interface BaseTriggerProps {
  icon?: LucideIcon | React.ComponentType<any>
  iconSize?: number | string
  size?: TriggerSize
  variant?: TriggerVariant
  buttonColor?: TriggerColor
  buttonClassName?: string
  badge?: string | number
  badgeClassName?: string
}
export const sizeClasses: Record<TriggerSize, { btn: string; iconOnly: string; iconSize: number }> = {
  xs: { btn: "h-6 min-w-6 px-2 text-xs", iconOnly: "size-6 p-0", iconSize: 14 },
  sm: { btn: "h-8 min-w-8 px-3 text-sm", iconOnly: "size-8 p-0", iconSize: 18 },
  md: { btn: "h-9 min-w-9 px-4 text-sm", iconOnly: "size-9 p-0", iconSize: 21 },
  lg: { btn: "h-12 min-w-12 px-6 text-base", iconOnly: "size-12 p-0", iconSize: 24 },
} as const  
export const colorClasses: Record<TriggerColor, string> = {
  green: "bg-green-600 hover:bg-green-700 text-white",
  red:   "bg-red-600 hover:bg-red-700 text-white",
  blue:  "bg-blue-600 hover:bg-blue-700 text-white",
  gray:  "bg-gray-800 hover:bg-gray-900 text-white",
} as const
export interface RenderIconProps {
  icon?: LucideIcon | React.ComponentType<any>
  size?: number | string
  className?: string
}
export const RenderIcon = ({ icon: Icon, size, className }: RenderIconProps) => {
  if (!Icon) return null
  return (
    <Icon 
      size={size} 
      style={{ width: size, height: size }} 
      className={cn("shrink-0", className)} 
    />
  )
}