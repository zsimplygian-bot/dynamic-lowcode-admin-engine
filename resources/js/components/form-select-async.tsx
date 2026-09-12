import { useState, useEffect, useCallback, useSyncExternalStore } from "react"
import { Input } from "@/components/ui/input"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import { NewRecordButton } from "@/components/new-record-button"
import { InfoButton } from "@/components/info-button"
import { SmartPopover } from "@/components/smart-popover"
import { ResetButton } from "@/components/reset-button"
import { AsyncState } from "@/components/async-state"
import { SearchInput } from "@/components/search-input"
import { useApi } from "@/hooks/use-api"
export interface ListaItem { id: string | number; label: string }
export interface ListaCache { options: ListaItem[]; isFull: boolean }
const cache = new Map<string, ListaCache>()
const listeners = new Map<string, Set<() => void>>()
const EMPTY: ListaCache = { options: [], isFull: false }
export const getListaSync = (key: string): ListaCache => cache.get(key) ?? EMPTY
export const subscribeCache = (key: string, cb: () => void) => {
  if (!key) return () => {}
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key)!.add(cb)
  return () => { listeners.get(key)?.delete(cb) }
}
const notify = (key: string) => listeners.get(key)?.forEach((cb) => cb())
export const updateListaCache = (key: string, incoming: any, isFull = false) => {
  if (!key || !incoming) return
  const list: ListaItem[] = Array.isArray(incoming) ? incoming : (incoming.options ?? [incoming])
  const current = getListaSync(key)
  if (isFull) {
    cache.set(key, { options: list, isFull: true })
  } else {
    const ids = new Set(current.options.map((o) => String(o.id)))
    const toAdd = list.filter((o) => o?.id != null && !ids.has(String(o.id)))
    if (!toAdd.length) return
    cache.set(key, { options: [...current.options, ...toAdd], isFull: current.isFull })
  }
  notify(key)
}
export const resetLista = (key: string) => {
  if (cache.delete(key)) notify(key)
}
interface FormSelectAsyncProps {
  id?: string
  name: string
  value?: string | number
  defaultValue?: string | number
  placeholder?: string
  disabled?: boolean
  className?: string
  onSelect?: (value: string) => void
}
export const FormSelectAsync = ({ id, name = "", value: valueProp, defaultValue, placeholder = "", disabled = false, className = "", onSelect }: FormSelectAsyncProps) => {
  const [open, setOpen] = useState(false)
  const [internalVal, setInternalVal] = useState(() => String(valueProp ?? defaultValue ?? ""))
  const currentValue = valueProp !== undefined ? String(valueProp ?? "") : internalVal
  const { options, isFull } = useSyncExternalStore(
    useCallback((cb) => subscribeCache(name, cb), [name]),
    () => getListaSync(name)
  )
  const needsLookup = Boolean(name && currentValue && !isFull && !options.some((o) => String(o.id) === currentValue))
  const { data: lookupData } = useApi(needsLookup ? `/lookups/${name}?id=${currentValue}` : null)
  const shouldFetchFull = Boolean(name && open && !isFull)
  const { data: fullData, isLoading: loadingLista, refetch } = useApi(shouldFetchFull ? `/lookups/${name}` : null)
  useEffect(() => {
    if (lookupData) updateListaCache(name, lookupData, false)
    if (fullData) updateListaCache(name, fullData, true)
  }, [name, lookupData, fullData])
  const handleRefresh = () => { resetLista(name); refetch() }
  const handleSelectOption = (optId: string) => {
    const next = currentValue === optId ? "" : optId
    setInternalVal(next)
    onSelect?.(next)
  }
  const selectedLabel = (options.find((o) => String(o.id) === currentValue)?.label ?? "").toUpperCase()
  const tableName = name.replace(/^id_/, "")
  const crudEndpoint = tableName ? `/crud/${tableName}` : ""
  return (
    <div>
      {name && <input type="hidden" name={name} value={currentValue} />}
      <SmartPopover open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen} trigger={
        <div className="relative">
          <Input id={id} disabled={disabled} value={selectedLabel} placeholder={placeholder} readOnly className={`pr-14 cursor-pointer text-left ${className}`} />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {currentValue && ( <div onClick={(e) => e.stopPropagation()}> <InfoButton row_id={currentValue} tableName={tableName} endpoint={crudEndpoint} onSuccess={handleRefresh}/> </div> )}
            <ChevronsUpDown className={`size-5 text-muted-foreground pointer-events-none ${disabled ? "" : ""}`} />
          </div>
        </div> } >
        {({ close }) => (
          <div className="p-1 relative" onWheel={(e) => e.stopPropagation()}>
            <div className="absolute right-2 top-2 flex gap-1 z-10">
              <ResetButton onReset={handleRefresh} isLoading={loadingLista} size="xs" /> <NewRecordButton tableName={tableName} endpoint={crudEndpoint} size="xs" onSuccess={handleRefresh} />
            </div>
            <AsyncState isLoading={loadingLista}>
              <SearchInput items={options} searchKey="label" disabled={disabled} className="pr-16">
                {(opt: any, reset: () => void) => {
                  const isSelected = currentValue === String(opt.id)
                  return (
                    <button key={opt.id} onClick={() => { handleSelectOption(String(opt.id)); reset(); close?.() }} className={`w-full flex items-center rounded-sm justify-between px-2 py-1.5 text-sm hover:bg-accent ${isSelected ? "bg-accent/60" : ""}`}>
                      <span>{opt.label}</span> {isSelected && <CheckIcon className="size-5" />}
                    </button>
                  )
                }}
              </SearchInput>
            </AsyncState>
          </div>
        )}
      </SmartPopover>
    </div>
  )
}

export default FormSelectAsync