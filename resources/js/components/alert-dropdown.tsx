import React, { memo, useCallback, useEffect, useMemo } from "react"
import { SmartDropdown } from "@/components/smart-dropdown"
import { Bell, LucideIcon } from "lucide-react"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"
import { AsyncState } from "@/components/async-state"
import { useApi } from "@/hooks/use-api"
import { toast } from "sonner"

export interface AlertItemProps {
  id: number | string
  icon?: LucideIcon
  title: React.ReactNode
  subtitle?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  tableName?: string
  onSuccess?: () => void
}

export const AlertItem = memo(({ id, icon: Icon = Bell, title, subtitle, description, actions, tableName, onSuccess }: AlertItemProps) => {
  const handleContainerClick = useCallback((e: React.MouseEvent) => { e.stopPropagation() }, [])
  return (
    <div className="flex items-center justify-between gap-2 px-2 py-2 select-none" onClick={handleContainerClick}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium">
          {Icon && <Icon className="w-4 h-4 text-blue-500 shrink-0" />}
          <span className="truncate">{title}</span> {subtitle && <span className="text-xs text-muted-foreground truncate">{subtitle}</span>}
        </div>
        {description && <div className="text-xs text-muted-foreground truncate">{description}</div>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {actions} {tableName && <ActionButtons row_id={id} tableName={tableName} onSuccess={onSuccess} size="sm" />}
      </div>
    </div>
  )
})
AlertItem.displayName = "AlertItem"

export interface AlertDropdownProps<T> {
  label: string
  icon?: LucideIcon
  tableName: string
  endpoint: string
  emptyText?: string
  renderItem: (item: T, refresh: () => void) => React.ReactNode
  getToastMessage?: (firstItem: T) => { title: string; description?: string } | null
}

export function AlertDropdown<T>({ label, icon = Bell, tableName, endpoint, emptyText = "Sin registros próximos", renderItem, getToastMessage }: AlertDropdownProps<T>) {
  const { data: items = [], isLoading, error, refetch } = useApi<T[]>(endpoint)

  useEffect(() => {
    if (items.length > 0 && getToastMessage) {
      const msg = getToastMessage(items[0])
      if (msg) {
        toast.info(msg.title, { description: msg.description, icon: <Bell className="w-4 h-4 text-blue-500" /> })
      }
    }
  }, [items, getToastMessage])

  const dropdownItems = useMemo(() => [
    { custom: (
        <AsyncState isLoading={isLoading} error={error} onRetry={refetch} minHeight="min-h-[60px]">
          {items.length ? items.map((item) => renderItem(item, refetch)) : <div className="px-2 py-1 text-xs text-muted-foreground">{emptyText}</div>}
        </AsyncState>
      )
    } ], [isLoading, error, items, refetch, renderItem, emptyText])

  return (
    <SmartDropdown label={label} icon={icon} variant="ghost" labelExtra={<NewRecordButton tableName={tableName} onSuccess={refetch} size="xs" />} 
      badge={items.length || undefined} badgeClassName="bg-red-700 text-white" itemsMaxHeight={500} items={dropdownItems} />
  )
}