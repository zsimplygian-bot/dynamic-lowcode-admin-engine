import { useState, useEffect, useCallback, useSyncExternalStore } from "react"
import { SelectBaseLayout, SelectOptionsList, SelectBaseProps } from "@/components/form-select-base"
import { NewRecordButton } from "@/components/new-record-button"
import { InfoButton } from "@/components/info-button"
import { ResetButton } from "@/components/reset-button"
import { AsyncState } from "@/components/async-state"
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
export const resetLista = (key: string) => { if (cache.delete(key)) notify(key) }
export interface FormSelectAsyncProps extends SelectBaseProps {
  name: string; onSelect?: (value: string) => void
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
  const handleSelectOption = (optId: string, close: () => void) => {
    const next = currentValue === optId ? "" : optId
    setInternalVal(next)
    onSelect?.(next)
    close()
  }
  const tableName = name.replace(/^id_/, "")
  return (
    <SelectBaseLayout id={id} name={name} value={currentValue} options={options} placeholder={placeholder} disabled={disabled} className={className} open={open} onOpenChange={setOpen}
      infoAction={currentValue ? <InfoButton row_id={currentValue} tableName={tableName}  variant="ghost" onSuccess={handleRefresh} /> : null}
      headerActions={<><ResetButton onReset={handleRefresh} isLoading={loadingLista} size="xs" /><NewRecordButton tableName={tableName} size="xs" onSuccess={handleRefresh} /></>}
    >
      {(close) => (
        <AsyncState isLoading={loadingLista}>
          <SelectOptionsList options={options} currentValue={currentValue} disabled={disabled} hasHeaderActions close={close} onSelectOption={handleSelectOption} />
        </AsyncState>
      )}
    </SelectBaseLayout>
  )
}
export default FormSelectAsync