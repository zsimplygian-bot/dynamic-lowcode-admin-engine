import React, { isValidElement } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type TriggerSize = "xs" | "sm" | "md" | "lg"
export type TriggerColor = "green" | "red" | "blue" | "gray"
export type TriggerVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"

export interface BaseTriggerProps {
  icon?: LucideIcon | React.ComponentType<any> | React.ReactNode
  iconSize?: number | string
  size?: TriggerSize
  variant?: TriggerVariant
  buttonColor?: TriggerColor
  buttonClassName?: string
  badge?: string | number
  badgeClassName?: string
}

export const sizeClasses: Record<TriggerSize, { btn: string; iconOnly: string; iconSize: number }> = {
  xs: { btn: "h-6 px-2 text-xs", iconOnly: "h-6 w-6 p-0", iconSize: 14 },
  sm: { btn: "h-8 px-3 text-sm", iconOnly: "h-8 w-8 p-0", iconSize: 16 },
  md: { btn: "h-9 px-4 text-sm", iconOnly: "h-9 w-9 p-0", iconSize: 18 },
  lg: { iconOnly: "h-12 w-12 p-0", btn: "h-12 px-6 text-base", iconSize: 22 },
}

export const colorClasses: Record<TriggerColor, string> = {
  green: "bg-green-600 hover:bg-green-700 text-white",
  red:   "bg-red-600 hover:bg-red-700 text-white",
  blue:  "bg-blue-600 hover:bg-blue-700 text-white",
  gray:  "bg-gray-800 hover:bg-gray-900 text-white",
}

export interface RenderIconProps {
  icon?: LucideIcon | React.ComponentType<any> | React.ReactNode
  size?: number | string
  className?: string
}

export const RenderIcon = ({ icon: Icon, size, className }: RenderIconProps) => {
  if (!Icon) return null
  if (isValidElement(Icon)) return Icon
  if (typeof Icon === "function" || (typeof Icon === "object" && Icon !== null)) {
    const IconComponent = Icon as React.ComponentType<any>
    return <IconComponent {...{ style: { width: size, height: size }, className: cn("shrink-0", className) }} />
  }
  return null
}