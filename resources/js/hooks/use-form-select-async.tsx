import { useMemo, useCallback, useState, useDeferredValue, useSyncExternalStore, useEffect } from "react"
import { getListaSync, updateListaCache, resetLista, subscribeCache } from "@/hooks/use-listas-cache"
import { useApi } from "@/hooks/use-api"
interface UseFormSelectAsyncProps {
  name?: string; valueProp?: string | number; defaultValue?: string | number
  onSelect?: (value: string) => void
}
export const useFormSelectAsync = ({ name = "", valueProp, defaultValue, onSelect }: UseFormSelectAsyncProps) => {
  const [internalVal, setInternalVal] = useState<string>(() => String(valueProp ?? defaultValue ?? ""))
  const value = valueProp !== undefined ? String(valueProp ?? "") : internalVal
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const tableName = useMemo(() => name.replace(/^id_/, ""), [name])
  const subscribe = useCallback((cb: () => void) => subscribeCache(name, cb), [name])
  const getSnapshot = useCallback(() => getListaSync(name), [name])
  const cacheState = useSyncExternalStore(subscribe, getSnapshot)
  const needsLookup = Boolean(name && value && !cacheState.isFull && !cacheState.options.some((o) => String(o.id) === String(value)))
  const { data: lookupData } = useApi(needsLookup ? `/lookups/${name}?id=${value}` : null)
  useEffect(() => { if (lookupData) updateListaCache(name, lookupData, false) }, [name, lookupData])
  const shouldFetchFull = Boolean(name && open && !cacheState.isFull)
  const { data: fullData, isLoading: loadingLista, refetch } = useApi(shouldFetchFull ? `/lookups/${name}` : null)
  useEffect(() => {
    if (shouldFetchFull) {
      refetch()
    }
  }, [shouldFetchFull, refetch])
  useEffect(() => { if (fullData) updateListaCache(name, fullData, true) }, [name, fullData])
  const handleRefresh = useCallback(() => {
    if (!name) return
    resetLista(name)
    refetch()
  }, [name, refetch])
  const selectedOption = useMemo(() => cacheState.options.find((o) => String(o.id) === String(value)), [cacheState.options, value])
  const selectedLabel = useMemo(() => selectedOption?.label ? String(selectedOption.label).toUpperCase() : "", [selectedOption])
  const filteredOptions = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    return q ? cacheState.options.filter((o) => String(o.label ?? "").toLowerCase().includes(q)) : cacheState.options
  }, [cacheState.options, deferredSearch])
  const handleSelectOption = useCallback((idSel: any) => {
    const next = String(value) === String(idSel) ? "" : String(idSel)
    setInternalVal(next)
    onSelect?.(next)
    setSearch("")
  }, [onSelect, value])
  return {
    value, open, setOpen, search, setSearch, loadingLista, selectedLabel, filteredOptions,
    tableName, crudEndpoint: tableName ? `/crud/${tableName}` : "", handleRefresh, handleSelectOption
  }
}