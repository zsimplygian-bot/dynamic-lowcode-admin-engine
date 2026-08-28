import { useMemo, useCallback, useState, useEffect, useDeferredValue, useSyncExternalStore } from "react"
import { getListaSync, updateListaCache, resetLista, subscribeCache } from "@/hooks/use-listas-cache"
import { useApi } from "@/hooks/use-api"

interface UseFormSelectAsyncProps {
  id?: string; valueProp?: string | number; defaultValue?: string | number
  openProp?: boolean; setOpenProp?: (open: boolean) => void; onSelect?: (value: string) => void
  lista?: string; name?: string
}

export const useFormSelectAsync = ({ id, valueProp, defaultValue, openProp, setOpenProp, onSelect, lista, name }: UseFormSelectAsyncProps) => {
  const [internalVal, setInternalVal] = useState<string>(() => String(valueProp ?? defaultValue ?? ""))
  const value = valueProp !== undefined ? String(valueProp ?? "") : internalVal

  const [openInternal, setOpenInternal] = useState(false)
  const open = openProp ?? openInternal
  const setOpen = setOpenProp ?? setOpenInternal

  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)

  const campoLista = lista ?? id ?? name ?? ""
  const tableName = useMemo(() => (name ?? id ?? lista ?? "").replace(/^id_/, "").toLowerCase().trim(), [name, id, lista])

  const cacheState = useSyncExternalStore(
    useCallback((cb) => subscribeCache(campoLista, cb), [campoLista]),
    useCallback(() => getListaSync(campoLista), [campoLista])
  )

  // 1. Resolver opción inicial individual si no está en la caché
  const needsInitialLookup = Boolean(campoLista && value && !cacheState.options.some((o) => String(o.id) === String(value)))
  
  useApi(`/lookups/${campoLista}`, {
    enabled: needsInitialLookup,
    config: { params: { id: value } },
    select: (data) => {
      const items = data?.data ?? data
      if (items) updateListaCache(campoLista, items, false)
      return items
    }
  })
  // 2. Cargar lista completa al abrir el select si no está completa en caché
  const needsFullFetch = Boolean(campoLista && open && !cacheState.isFull)
  const { isLoading: loadingLista, refetch } = useApi(`/lookups/${campoLista}`, {
    enabled: needsFullFetch,
    select: (data) => {
      const items = data?.data ?? data
      if (items) updateListaCache(campoLista, items, true)
      return items
    }
  })
  // 3. Refrescar lista forzadamente
  const handleRefresh = useCallback(() => {
    if (!campoLista) return
    resetLista(campoLista)
    refetch()
  }, [campoLista, refetch])

  const selectedOption = useMemo(() => cacheState.options.find((o) => String(o.id) === String(value)) ?? null, [cacheState.options, value])
  const selectedLabel = useMemo(() => (selectedOption ? String(selectedOption.label ?? "").toUpperCase() : ""), [selectedOption])

  const filteredOptions = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    return q ? cacheState.options.filter((o) => String(o.label ?? "").toLowerCase().includes(q)) : cacheState.options
  }, [cacheState.options, deferredSearch])

  const handleSelectOption = useCallback((idSel: any) => {
    const next = String(value) === String(idSel) ? "" : String(idSel)
    setInternalVal(next)
    onSelect?.(next)
    setOpen(false)
    setSearch("")
  }, [onSelect, setOpen, value])

  return {
    value, open, setOpen, search, setSearch, loadingLista, selectedLabel, filteredOptions,
    tableName, crudEndpoint: tableName ? `/crud/${tableName}` : "", handleRefresh, handleSelectOption
  }
}