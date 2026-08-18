import { useMemo, useCallback, useState, useEffect, useDeferredValue, useSyncExternalStore } from "react"
import { getListaSync, setListaCache, resetLista, subscribeCache } from "@/hooks/use-listas-cache"
import { useApi } from "@/hooks/use-api"
interface UseFormSelectAsyncProps {
  id?: string
  valueProp?: string | number
  defaultValue?: string | number
  openProp?: boolean
  setOpenProp?: (open: boolean) => void
  onSelect?: (value: string) => void
  lista?: string
  name?: string
}
const EMPTY_ARRAY: any[] = []
export const useFormSelectAsync = ({ id, valueProp, defaultValue, openProp, setOpenProp, onSelect, lista, name }: UseFormSelectAsyncProps) => {
  const rawValue = valueProp ?? defaultValue
  const [internalValue, setInternalValue] = useState<string>("")
  useEffect(() => {
    setInternalValue(rawValue !== undefined && rawValue !== null ? String(rawValue) : "")
  }, [rawValue])
  const value = rawValue !== undefined && rawValue !== null ? String(rawValue) : internalValue
  const [openInternal, setOpenInternal] = useState(false)
  const open = openProp ?? openInternal
  const setOpen = setOpenProp ?? setOpenInternal
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [forceFetchCount, setForceFetchCount] = useState(0)
  const campoLista = lista ?? id ?? name ?? ""
  // Sincronización atómica sin renders intermedios vía useSyncExternalStore
  const subscribe = useCallback((cb: () => void) => subscribeCache(campoLista, cb), [campoLista])
  const getSnapshot = useCallback(() => getListaSync(campoLista), [campoLista])
  const cacheState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const isSelectedInCache = useMemo(() => {
    if (!value || !cacheState.options.length) return false
    return cacheState.options.some((o) => String(o.id) === String(value))
  }, [value, cacheState.options])
  const shouldFetchSingle = Boolean(campoLista && value && !isSelectedInCache)
  const singleUrl = useMemo(() => (shouldFetchSingle ? `/lookups/${campoLista}?id=${value}${forceFetchCount ? `&ts=${forceFetchCount}` : ""}` : null), [shouldFetchSingle, campoLista, value, forceFetchCount])
  const { data: rawSingleData } = useApi(singleUrl, { enabled: shouldFetchSingle })
  const shouldFetchFull = Boolean(campoLista && open && !cacheState.isFullLoaded)
  const fullUrl = useMemo(() => (shouldFetchFull ? `/lookups/${campoLista}${forceFetchCount ? `?ts=${forceFetchCount}` : ""}` : null), [shouldFetchFull, campoLista, forceFetchCount])
  const { data: rawFullData, isLoading: loadingLista } = useApi(fullUrl, { enabled: shouldFetchFull })
  useEffect(() => {
    if (rawFullData) setListaCache(campoLista, rawFullData, true)
  }, [rawFullData, campoLista])
  useEffect(() => {
    if (rawSingleData && !rawFullData) setListaCache(campoLista, rawSingleData, false)
  }, [rawSingleData, rawFullData, campoLista])
  const entityName = useMemo(() => (cacheState.viewConfig?.view || campoLista || "").toLowerCase().trim(), [cacheState.viewConfig?.view, campoLista])
  const handleRefresh = useCallback(() => {
    if (!campoLista) return
    resetLista(campoLista)
    setForceFetchCount((p) => p + 1)
  }, [campoLista])
  const selectedOption = useMemo(() => (value ? cacheState.options.find((o) => String(o.id) === String(value)) ?? null : null), [cacheState.options, value])
  const selectedLabel = useMemo(() => (selectedOption ? String(selectedOption.label ?? "").toUpperCase() : ""), [selectedOption])
  const filteredOptions = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()
    if (!query) return cacheState.options
    return cacheState.options.filter((o) => String(o.label ?? "").toLowerCase().includes(query))
  }, [cacheState.options, deferredSearch])
  const handleSelectOption = useCallback((idSelected: any) => {
    const selectedStr = String(idSelected)
    const newValue = String(value) === selectedStr ? "" : selectedStr
    setInternalValue(newValue)
    onSelect?.(newValue)
    setOpen(false)
    setSearch("")
  }, [onSelect, setOpen, value])
  const crudEndpoint = useMemo(() => (entityName ? `/crud/${entityName}` : ""), [entityName])
  const preparedInitialValues = useMemo(() => (value ? selectedOption ?? { id: value } : {}), [value, selectedOption])
  const viewFields = useMemo(() => cacheState.viewConfig?.fields ?? EMPTY_ARRAY, [cacheState.viewConfig?.fields])
  return {
    value, open, setOpen, search, setSearch, cacheState, loadingLista, selectedLabel, filteredOptions,
    entityName, crudEndpoint, preparedInitialValues, viewFields, handleRefresh, handleSelectOption
  }
}