import { useMemo, useCallback, useState, useSyncExternalStore, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import { NewRecordButton } from "@/components/new-record-button"
import { InfoButton } from "@/components/info-button"
import { SmartPopover } from "@/components/smart-popover"
import { ResetButton } from "@/components/reset-button"
import { AsyncState } from "@/components/async-state"
import { SearchInput } from "@/components/search-input"
import { useApi } from "@/hooks/use-api"
export interface ListaItem { id: any; label: string }
export interface ListaCache { options: ListaItem[]; isFull: boolean }
const cache = new Map<string, ListaCache>()
const listeners = new Map<string, Set<() => void>>()
const EMPTY: ListaCache = { options: [], isFull: false }
export const getListaSync = (k: string): ListaCache => cache.get(k) ?? EMPTY
export const subscribeCache = (k: string, cb: () => void) => {
  if (!k) return () => {}
  if (!listeners.has(k)) listeners.set(k, new Set())
  listeners.get(k)!.add(cb)
  return () => { listeners.get(k)?.delete(cb) }
}
const notify = (k: string) => listeners.get(k)?.forEach((cb) => cb())
export const updateListaCache = (k: string, incoming: any, isFull = false) => {
  if (!k || !incoming) return
  const rawList: ListaItem[] = Array.isArray(incoming) ? incoming : (incoming.options ?? [incoming])
  const current = getListaSync(k)
  if (isFull) {
    cache.set(k, { options: rawList, isFull: true })
  } else {
    const map = new Map(current.options.map((o) => [String(o.id), o]))
    rawList.forEach((o) => { if (o?.id != null) map.set(String(o.id), o) })
    cache.set(k, { options: Array.from(map.values()), isFull: current.isFull })
  } notify(k)
}
export const resetLista = (k: string) => {
  if (!k) return
  cache.delete(k)
  notify(k)
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
const useFormSelectAsync = ({ name = "", valueProp, defaultValue, onSelect }: { name?: string; valueProp?: string | number; defaultValue?: string | number; onSelect?: (value: string) => void }) => {
  const [internalVal, setInternalVal] = useState(() => String(valueProp ?? defaultValue ?? ""))
  const value = valueProp !== undefined ? String(valueProp ?? "") : internalVal
  const [open, setOpen] = useState(false)
  const tableName = useMemo(() => name.replace(/^id_/, ""), [name])
  const cacheState = useSyncExternalStore(
    useCallback((cb) => subscribeCache(name, cb), [name]),
    useCallback(() => getListaSync(name), [name])
  )
  const needsLookup = Boolean(name && value && !cacheState.isFull && !cacheState.options.some((o) => String(o.id) === value))
  const { data: lookupData } = useApi(needsLookup ? `/lookups/${name}?id=${value}` : null)
  useEffect(() => {
    if (lookupData) updateListaCache(name, lookupData, false)
  }, [name, lookupData])
  const shouldFetchFull = Boolean(name && open && !cacheState.isFull)
  const { data: fullData, isLoading: loadingLista, refetch } = useApi(shouldFetchFull ? `/lookups/${name}` : null)
  useEffect(() => {
    if (shouldFetchFull) refetch()
  }, [shouldFetchFull, refetch])
  useEffect(() => {
    if (fullData) updateListaCache(name, fullData, true)
  }, [name, fullData])
  const handleRefresh = useCallback(() => {
    if (!name) return
    resetLista(name)
    refetch()
  }, [name, refetch])
  const selectedOption = cacheState.options.find((o) => String(o.id) === value)
  const selectedLabel = selectedOption?.label ? String(selectedOption.label).toUpperCase() : ""
  const handleSelectOption = useCallback((idSel: string) => {
    const next = value === idSel ? "" : idSel
    setInternalVal(next)
    onSelect?.(next)
  }, [onSelect, value])
  return { value, open, setOpen, loadingLista, selectedLabel, options: cacheState.options, tableName, crudEndpoint: tableName ? `/crud/${tableName}` : "", handleRefresh, handleSelectOption }
}
export const FormSelectAsync = ({ name, value: valueProp, defaultValue, placeholder = "", disabled = false, className, onSelect }: FormSelectAsyncProps) => {
  const { value, open, setOpen, loadingLista, selectedLabel, options, tableName, crudEndpoint, handleRefresh, handleSelectOption
  } = useFormSelectAsync({ name, valueProp, defaultValue, onSelect })
  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <SmartPopover open={open} onOpenChange={setOpen} trigger={
          <div className="relative">
            <Input disabled={disabled} value={selectedLabel} placeholder={placeholder} readOnly className={`pr-14 cursor-pointer text-left ${className ?? ""}`} />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {value && ( <div onClick={(e) => e.stopPropagation()}><InfoButton row_id={value} tableName={tableName} endpoint={crudEndpoint} onSuccess={handleRefresh}/></div>
              )} <ChevronsUpDown className="size-5 text-muted-foreground" />
            </div>
          </div> } >
        {({ close }) => (
          <div className="p-1" onWheel={(e) => e.stopPropagation()}>
            <SearchInput items={options} searchKey="label" disabled={disabled}>
              {({ filteredItems, resetSearch, search }) => (
                <><div className="absolute right-2 top-2 flex gap-1 z-10">
                    <ResetButton onReset={handleRefresh} isLoading={loadingLista} size="xs"/><NewRecordButton tableName={tableName} endpoint={crudEndpoint} size="xs" onSuccess={handleRefresh}/>
                  </div>
                  <div className="max-h-70 overflow-y-auto space-y-0.5 mt-1">
                    <AsyncState isLoading={loadingLista}>
                      {filteredItems.length === 0 ? ( <div className="py-2 text-center text-sm text-muted-foreground">{search ? "No hay coincidencias." : "Sin opciones."}</div>
                      ) : (
                        filteredItems.map((opt) => {
                          const optId = String(opt.id)
                          const isSelected = value === optId
                          return (
                            <button key={optId} type="button" onClick={() => { handleSelectOption(optId); resetSearch(); close?.() }} className={`w-full flex items-center rounded-sm justify-between px-2 py-1.5 text-sm hover:bg-accent ${isSelected ? "bg-accent/60 " : ""}`}>
                              <span className="truncate">{opt.label}</span> {isSelected && <CheckIcon className="size-5" />}
                            </button>
                          )
                        })
                      )}
                    </AsyncState>
                  </div>
                </>
              )}
            </SearchInput>
          </div>
        )}
      </SmartPopover>
    </div>
  )
}
export default FormSelectAsync