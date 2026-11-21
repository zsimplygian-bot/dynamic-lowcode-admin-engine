import React, { useState, useEffect } from "react"
import { useApi } from "@/hooks/use-api"
import { Input } from "@/components/ui/input"
import { DynamicIcon } from "@/components/dynamic-icon"
import { SmartPopover } from "@/components/smart-popover"
import { SearchInput } from "@/components/search-input"
import { NewRecordButton } from "@/components/new-record-button"
import { InfoButton } from "@/components/info-button"
import { ResetButton } from "@/components/reset-button"
import { Async } from "@/components/async-state"
const cache = new Map<string, any[]>()
export interface FormSelectProps { id?: string; name?: string; value?: string | number; defaultValue?: string | number; options?: any[]; endpoint?: string; placeholder?: string; disabled?: boolean; className?: string; open?: boolean; searchable?: boolean; onOpenChange?: (open: boolean) => void; onSelect?: (value: string) => void; onChange?: (value: string) => void }
export const FormSelect = ({ id, name = "", value: valueProp, defaultValue, options: staticOptions, endpoint, placeholder = "", disabled = false, className = "", open: openProp, searchable, onOpenChange, onSelect, onChange }: FormSelectProps) => {
  const isAsync = !staticOptions?.length, isSearchable = searchable ?? isAsync
  const [internalOpen, setInternalOpen] = useState(false), [internalVal, setInternalVal] = useState(() => String(valueProp ?? defaultValue ?? ""))
  const [asyncOpts, setAsyncOpts] = useState<any[]>(() => cache.get(name) ?? [])
  const options = staticOptions ?? asyncOpts, [filtered, setFiltered] = useState<any[]>(options)
  useEffect(() => setFiltered(options), [options])
  const isOpen = openProp ?? internalOpen, handleOpenChange = (o: boolean) => { setInternalOpen(o); onOpenChange?.(o) }
  const val = String(valueProp ?? internalVal)
  const url = isAsync ? (endpoint ?? `/api/lookups/${name}`) : ""
  const matched = options.find((o) => String(o.id) === val || String(o.label) === val)
  const targetId = matched ? String(matched.id) : val, selectedLabel = matched?.label ?? val
  const initialUrl = isAsync && val && !matched ? `${url}?id=${encodeURIComponent(val)}` : null
  const { data: initialData, isLoading: loadingInit, error: errorInit } = useApi<any>(initialUrl)
  const { data, isLoading, error, refetch } = useApi(isAsync && isOpen && !cache.has(name) ? url : null)
  const loading = isAsync && (isLoading || Boolean(initialUrl && loadingInit))
  const displayValue = loadingInit ? "" : selectedLabel
  useEffect(() => {
    if (initialData) {
      const items = Array.isArray(initialData) ? initialData : [initialData]
      setAsyncOpts((prev) => [...prev, ...items.filter((i) => !prev.some((p) => String(p.id) === String(i.id)))])
    }
  }, [initialData])
  useEffect(() => {
    if (data) {
      const opts = Array.isArray(data) ? data : data.options ?? []
      cache.set(name, opts); setAsyncOpts(opts)
    }
  }, [data, name])
  const handleRefresh = () => { cache.delete(name); setAsyncOpts([]); refetch() }
  const handleSelect = (optId: string, close: () => void) => {
    const next = val === optId ? "" : optId
    if (valueProp === undefined) setInternalVal(next)
    onSelect?.(next); onChange?.(next); close()
  }
  const infoAction = isAsync && targetId ? <InfoButton row_id={targetId} tableName={name.replace(/_id$/, "")} variant="ghost"/> : null
  const headerActions = isAsync ? <><ResetButton onReset={handleRefresh} isLoading={loading} size="xs"/><NewRecordButton tableName={name.replace(/_id$/, "")} size="xs" onSuccess={handleRefresh}/></> : null
  const renderList = (close: () => void) => (
    <div className="flex flex-col gap-1">
      {isSearchable && <SearchInput items={options} searchKey="label" disabled={disabled} onFiltered={setFiltered} />}
      <div className="max-h-60 overflow-y-auto space-y-0.5">
        {(isSearchable ? filtered : options).map((opt: any) => {
          const optId = String(opt.id), optLabel = String(opt.label), isSelected = val === optId || val === optLabel
          return (
            <button key={opt.id} type="button" onClick={() => handleSelect(optId, close)} className={`w-full flex items-center rounded-sm justify-between px-2 py-1.5 text-sm hover:bg-accent ${isSelected ? "bg-accent/60" : ""}`}>
              <span>{opt.label}</span> {isSelected && <DynamicIcon name="check"/>}
            </button>
          )
        })}
      </div>
    </div>
  )
  return (
    <div className="w-full">
      {name && <input type="hidden" name={name} value={targetId} />}
      <SmartPopover open={disabled || loadingInit ? false : isOpen} onOpenChange={disabled || loadingInit ? undefined : handleOpenChange} trigger={
        <div className="relative w-full">
          <Input id={id} name={undefined} disabled={disabled || loadingInit} value={displayValue} placeholder={loadingInit ? "..." : placeholder} 
            readOnly className={`pl-2.5 ${infoAction ? "pr-12" : "pr-7"} cursor-pointer text-left w-full text-ellipsis ${className}`} />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            {infoAction && <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>{infoAction}</div>}
            <DynamicIcon name="chevrons-up-down" className="text-muted-foreground" />
          </div>
        </div>
      }>
        {({ close }) => (
          <div className="p-1 relative min-w-[160px]" onWheel={(e) => e.stopPropagation()}>
            {isAsync ? (
              <Async isLoading={loading} error={error || errorInit} onRetry={handleRefresh}>
                {headerActions && <div className="absolute right-2 top-2 flex gap-1 z-10">{headerActions}</div>} {renderList(close)}
              </Async>
            ) : renderList(close)}
          </div>
        )}
      </SmartPopover>
    </div>
  )
}
export default FormSelect