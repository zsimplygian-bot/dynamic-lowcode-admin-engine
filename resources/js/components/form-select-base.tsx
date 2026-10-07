import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { DynamicIcon } from "@/components/dynamic-icon"
import { SmartPopover } from "@/components/smart-popover"
import { SearchInput, SearchEmpty } from "@/components/search-input"
export interface SelectBaseProps {
  id?: string; name?: string; value?: string | number; defaultValue?: string | number; options?: any[]
  placeholder?: string; disabled?: boolean; className?: string; open?: boolean; onOpenChange?: (open: boolean) => void
  infoAction?: React.ReactNode; headerActions?: React.ReactNode; children: (close: () => void) => React.ReactNode
}
export const SelectBaseLayout = ({ id, name, value = "", defaultValue = "", options = [], placeholder = "", disabled = false, className = "", open, onOpenChange, infoAction, headerActions, children }: SelectBaseProps) => {
  const currentVal = String(value || defaultValue)
  const selectedLabel = options.find((o: any) => String(o.id) === currentVal)?.label ?? ""
  return (
    <div className="w-full">
      {name && <input type="hidden" name={name} value={currentVal} />}
      <SmartPopover open={disabled ? false : open} onOpenChange={disabled ? undefined : onOpenChange} trigger={
        <div className="relative w-full">
          <Input id={id} name={undefined} disabled={disabled} value={selectedLabel} placeholder={placeholder} readOnly className={`pr-14 cursor-pointer text-left w-full ${className}`} />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {infoAction && <div onClick={(e) => e.stopPropagation()}>{infoAction}</div>}
            <DynamicIcon name="chevrons-up-down" className="size-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      }>
        {({ close }) => (
          <div className="p-1 relative min-w-[200px]" onWheel={(e) => e.stopPropagation()}>
            {headerActions && <div className="absolute right-2 top-2 flex gap-1 z-10">{headerActions}</div>}
            {children(close)}
          </div>
        )}
      </SmartPopover>
    </div>
  )
}
export interface SelectOptionsListProps {
  options: any[]; currentValue: string; disabled?: boolean; hasHeaderActions?: boolean
  onSelectOption: (id: string, close: () => void) => void; close: () => void
}
export const SelectOptionsList = ({ options = [], currentValue, disabled, hasHeaderActions, onSelectOption, close }: SelectOptionsListProps) => {
  const [{ filtered, query }, setFilterState] = useState<{ filtered: any[]; query: string }>({ filtered: options, query: "" })
  return (
    <div className="flex flex-col gap-1">
      <SearchInput items={options} searchKey="label" disabled={disabled} className={hasHeaderActions ? "pr-16" : ""} onFilter={setFilterState} />
      <div className="max-h-60 overflow-y-auto space-y-0.5">
        {!filtered.length ? ( <SearchEmpty query={query} />
        ) : (
          filtered.map((opt: any) => {
            const optId = String(opt.id)
            const isSelected = currentValue === optId
            return (
              <button key={opt.id} type="button" onClick={() => onSelectOption(optId, close)} className={`w-full flex items-center rounded-sm justify-between px-2 py-1.5 text-sm hover:bg-accent ${isSelected ? "bg-accent/60" : ""}`}>
                <span>{opt.label}</span>
                {isSelected && <DynamicIcon name="check" className="size-5" />}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}