import { useState, useCallback, useMemo } from "react"
import { useApi } from "@/hooks/use-api"
import { useDataTableStorage } from "./use-datatable-storage"

interface UseDataTableOptions {
  tableName: string
  endpoint?: string
  columns?: any[]
}

const DEFAULT_QUERY = { pageIndex: 0, pageSize: 10, sortBy: null, sortOrder: "asc", appliedSearchValues: {} }

const getInitialVisibility = (columns: any[]) =>
  columns.reduce((acc, col) => {
    if (col.accessor) acc[col.accessor] = !col.hidden
    return acc
  }, {} as Record<string, boolean>)

export const useDataTable = ({ tableName, endpoint = `/crud/${tableName}`, columns = [] }: UseDataTableOptions) => {
  const STORAGE_KEY = `datatable_params_${tableName}`

  const effectiveColumns = useMemo(() => ((columns && columns.length > 0) ? columns : []), [columns])
  const defaultVisibility = useMemo(() => getInitialVisibility(effectiveColumns), [effectiveColumns])

  const initialStorageValue = useMemo(() => ({
    query: DEFAULT_QUERY,
    ui: { columnVisibility: defaultVisibility },
  }), [defaultVisibility])

  const { storedValue, setStoredValue, clearStorage } = useDataTableStorage(STORAGE_KEY, initialStorageValue)
  const { query, ui } = storedValue

  const columnVisibility = useMemo(() => ({
    ...defaultVisibility,
    ...(ui?.columnVisibility || {}),
  }), [defaultVisibility, ui?.columnVisibility])

  const [refreshIndex, setRefreshIndex] = useState(0)

  const setQuery = useCallback((updater: any) => {
    setStoredValue((prev: any) => ({ ...prev, query: typeof updater === "function" ? updater(prev.query) : updater }))
  }, [setStoredValue])

  const setColumnVisibility = useCallback((updater: any) => {
    setStoredValue((prev: any) => ({
      ...prev,
      ui: { ...prev.ui, columnVisibility: typeof updater === "function" ? updater(columnVisibility) : updater },
    }))
  }, [setStoredValue, columnVisibility])

  const searchValuesString = JSON.stringify(query.appliedSearchValues)
  const apiConfig = useMemo(() => {
    const { date_from, date_to, ...otherFilters } = query.appliedSearchValues as Record<string, any>

    const filters = Object.entries(otherFilters)
      .filter(([, v]) => Boolean(v))
      .reduce((acc, [k, v]) => ({ ...acc, [`filters[${k}]`]: v }), {})

    return {
      params: {
        page: query.pageIndex + 1, per_page: query.pageSize,
        ...(query.sortBy && { sort_by: query.sortBy, sort_order: query.sortOrder }),
        ...(date_from && { date_from }),
        ...(date_to && { date_to }),
        ...filters, _r: refreshIndex,
      },
    }
  }, [query.pageIndex, query.pageSize, query.sortBy, query.sortOrder, searchValuesString, refreshIndex])

  const { data: apiResponse, isLoading, error, setData: setApiResponse, refetch } = useApi(endpoint, {
    enabled: Boolean(endpoint), config: apiConfig, select: (resData: any) => resData,
  })

  const tableData = useMemo(() => ({
    data: apiResponse?.data ?? [], columns: apiResponse?.columns ?? columns, totalRows: apiResponse?.total ?? 0,
  }), [apiResponse, columns])

  const visibleColumns = useMemo(
    () => (tableData.columns ?? []).filter((c: any) => columnVisibility[c.accessor] ?? !c.hidden),
    [tableData.columns, columnVisibility]
  )

  const searchFields = useMemo(() => (
    (tableData.columns ?? [])
      .filter((col: any) => col.accessor && col.searchable === true)
      .map((col: any) => ({
        id: col.accessor, name: col.accessor, label: col.header || col.label || col.accessor,
        type: col.type || "text", placeholder: "", defaultValue: "",
      }))
  ), [tableData.columns])

  const activeFiltersCount = useMemo(() => (
    Object.values(query.appliedSearchValues || {}).filter((v) => v !== undefined && v !== null && v !== "").length
  ), [query.appliedSearchValues])

  // Cuenta únicamente las llaves aplicadas que pertenecen a los campos definidos en searchFields
  const activeSearchCount = useMemo(() => {
    const validKeys = new Set(searchFields.map((f: any) => f.id))
    return Object.entries(query.appliedSearchValues || {}).filter(([k, v]) => validKeys.has(k) && v !== undefined && v !== null && v !== "").length
  }, [query.appliedSearchValues, searchFields])

  const isFiltered = useMemo(() => {
    const hasQueryChanges =
      query.pageIndex !== DEFAULT_QUERY.pageIndex ||
      query.pageSize !== DEFAULT_QUERY.pageSize ||
      query.sortBy !== DEFAULT_QUERY.sortBy ||
      query.sortOrder !== DEFAULT_QUERY.sortOrder ||
      Object.keys(query.appliedSearchValues).length > 0

    const hasVisibilityChanges = JSON.stringify(columnVisibility) !== JSON.stringify(defaultVisibility)

    return hasQueryChanges || hasVisibilityChanges
  }, [query, columnVisibility, defaultVisibility])

  const totalPages = Math.max(1, Math.ceil(tableData.totalRows / query.pageSize))

  const handleSort = useCallback((accessor: string) => {
    setQuery((q: any) => ({ ...q, sortBy: accessor, sortOrder: q.sortBy === accessor && q.sortOrder === "asc" ? "desc" : "asc", pageIndex: 0 }))
  }, [setQuery])

  const resetAll = useCallback(() => clearStorage(), [clearStorage])

  const setPageIndex = useCallback((pageIndex: number) => {
    setQuery((q: any) => ({ ...q, pageIndex: Math.min(Math.max(pageIndex, 0), Math.max(0, Math.ceil(tableData.totalRows / q.pageSize) - 1)) }))
  }, [tableData.totalRows, setQuery])

  const setPageSize = useCallback((pageSize: number) => {
    setQuery((q: any) => ({ ...q, pageSize: Math.max(pageSize, 1), pageIndex: 0 }))
  }, [setQuery])

  const setFilters = useCallback((filters: Record<string, any>) => {
    setQuery((q: any) => {
      const updated = { ...q.appliedSearchValues }
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") updated[k] = v
        else delete updated[k]
      })
      return { ...q, appliedSearchValues: updated, pageIndex: 0 }
    })
  }, [setQuery])

  const clearFilters = useCallback(() => {
    setQuery((q: any) => ({ ...q, appliedSearchValues: {}, pageIndex: 0 }))
  }, [setQuery])

  const fetchData = useCallback(() => {
    if (typeof refetch === "function") refetch()
    else setRefreshIndex((prev) => prev + 1)
  }, [refetch])

  const getRowKey = useCallback((row: any, index: number) => (
    row?.id ?? row?.[`id_${tableName?.toLowerCase()}`] ?? index
  ), [tableName])

  const pagination = useMemo(() => ({
    pageIndex: query.pageIndex, pageSize: query.pageSize, totalRows: tableData.totalRows, totalPages,
    isFirstPage: query.pageIndex === 0, isLastPage: query.pageIndex >= totalPages - 1,
    goToPage: (p: number | string) => setPageIndex(typeof p === "string" ? parseInt(p, 10) : p - 1),
    changePageSize: (s: number | string) => setPageSize(typeof s === "string" ? parseInt(s, 10) : s),
    goToFirstPage: () => setPageIndex(0),
    goToPreviousPage: () => setQuery((q: any) => ({ ...q, pageIndex: Math.max(0, q.pageIndex - 1) })),
    goToNextPage: () => setQuery((q: any) => ({ ...q, pageIndex: Math.min(totalPages - 1, q.pageIndex + 1) })),
    goToLastPage: () => setPageIndex(totalPages - 1), setPageIndex, setPageSize,
  }), [query.pageIndex, query.pageSize, tableData.totalRows, totalPages, setPageIndex, setPageSize, setQuery])

  const isTableLoading = isLoading || !apiResponse

  return useMemo(() => ({
    ...query, ...tableData, visibleColumns, searchFields, activeFiltersCount, activeSearchCount, pagination, getRowKey, isFiltered,
    loading: isTableLoading, isReady: !isTableLoading, error, tableName, endpoint, columnVisibility, totalPages,
    handleSort, resetAll, setColumnVisibility, setFilters, clearFilters, fetchData, setApiResponse,
  }), [query, tableData, visibleColumns, searchFields, activeFiltersCount, activeSearchCount, pagination, getRowKey, isFiltered, isTableLoading, error, tableName, endpoint, columnVisibility, totalPages, handleSort, resetAll, setColumnVisibility, setFilters, clearFilters, fetchData, setApiResponse])
}