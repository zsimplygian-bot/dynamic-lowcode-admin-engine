import { useMemo, useCallback, useState, useEffect, useDeferredValue, useSyncExternalStore } from "react"
import { getListaSync, setListaCache, resetLista, subscribeCache } from "@/hooks/use-listas-cache"
import { useApi } from "@/hooks/use-api"

interface UseFormSelectAsyncProps {
  id?: string; valueProp?: string | number; defaultValue?: string | number
  openProp?: boolean; setOpenProp?: (open: boolean) => void; onSelect?: (value: string) => void
  lista?: string; name?: string
}

export const useFormSelectAsync = ({ id, valueProp, defaultValue, openProp, setOpenProp, onSelect, lista, name }: UseFormSelectAsyncProps) => {
  const [internalValue, setInternalValue] = useState<string>(() => {
    const init = valueProp ?? defaultValue
    return init !== undefined && init !== null ? String(init) : ""
  })

  useEffect(() => {
    if (valueProp !== undefined) setInternalValue(valueProp !== null ? String(valueProp) : "")
  }, [valueProp])

  const value = valueProp !== undefined ? (valueProp !== null ? String(valueProp) : "") : internalValue
  const [openInternal, setOpenInternal] = useState(false)
  const open = openProp ?? openInternal
  const setOpen = setOpenProp ?? setOpenInternal

  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [forceFetchCount, setForceFetchCount] = useState(0)

  const campoLista = lista ?? id ?? name ?? ""

  // Extrae el nombre de tabla eliminando el prefijo 'id_' inicial
  const tableName = useMemo(() => {
    const raw = name ?? id ?? lista ?? ""
    return raw.replace(/^id_/, "").toLowerCase().trim()
  }, [name, id, lista])

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

  const crudEndpoint = useMemo(() => (tableName ? `/crud/${tableName}` : ""), [tableName])
  const preparedInitialValues = useMemo(() => (value ? selectedOption ?? { id: value } : {}), [value, selectedOption])

  return {
    value, open, setOpen, search, setSearch, cacheState, loadingLista, selectedLabel, filteredOptions,
    tableName, crudEndpoint, preparedInitialValues, handleRefresh, handleSelectOption
  }
}